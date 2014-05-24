define('spec/surfnperf_spec', [
  'surfnperf'
], function(
  SurfNPerf
) {
  describe('SurfNPerf', function() {

    var NOW_TS = 1388595600000, // Wed Jan 01 2014 12:00:00 GMT-0500 (EST)
        NOW_HIGH_RES = 3.1415926;

    beforeEach(function() {
      if (typeof window.performance === 'undefined') {
        window.performance = {
          now: function() {
            return NOW_HIGH_RES;
          },
          timing: { }
        };
      }
      spyOn(window.performance, 'now').andReturn(NOW_HIGH_RES);
      spyOn(Date, 'now').andReturn(NOW_TS);
    });

    describe('Singleton Behavior', function() {
      it('is only instantiated once, even if the library is attempted to be instantiated more than once (as good singletons do)', function() {
        var a = SurfNPerf, b = SurfNPerf;
        expect(a).toBe(b);
      });
    });

    describe('#initialize', function() {

      beforeEach(function() {
        SurfNPerf.initialize();
      });

      it('sets the Performance API properties appropriately', function() {
        expect(SurfNPerf._navigationTiming).not.toBeNull();
        expect(SurfNPerf._highResTime).not.toBeNull();
      });

      it('ensures the SURF_N_PERF global object exists', function() {
        expect(window.SURF_N_PERF.marks).toBeDefined();
        expect(window.SURF_N_PERF.highResMarks).toBeDefined();;
      });

      it('stores the URL pathname as "initialUrl"', function() {
        expect(SurfNPerf.getCustom('initialUrl')).toEqual(window.location.pathname);
      });

    });

    describe('#now', function() {

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = true;
        });

        it('returns the current time as a DOMHighResTimeStamp by default', function() {
          expect(SurfNPerf.now()).toEqual(NOW_HIGH_RES);
        });

        it('returns the current time as a DOMHighResTimeStamp if "higRes" is passed as an argument', function() {
          expect(SurfNPerf.now('highRes')).toEqual(NOW_HIGH_RES);
        });

        it('returns the current time as a DOMTimeStamp if "DOM" is passed as an argument', function() {
          expect(SurfNPerf.now('DOM')).toEqual(NOW_TS);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = false;
        });

        it('returns the current time', function() {
          expect(SurfNPerf.now()).toEqual(NOW_TS);
        });

      });

    });

    describe('#getTimingMark', function() {

      beforeEach(function() {
        spyOn(SurfNPerf, '_performanceTiming').andReturn({
          loadEventEnd: 1388578320000
        });
        SURF_N_PERF = {
          marks: {
            loadEventEnd: 1388578320001
          },
          highResMarks: {
            loadEventEnd: 1.6180339887
          }
        };
      });

      describe('when the client supports the High Resolution Time spec (& should therefore support the Navigation Timing L1 spec)', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = true;
        });

        it('returns the window.performance.timing value of the event by default', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "DOM" is passed as an argument', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd','DOM')).toEqual(1388578320000);
        });

        it('returns the SURF_N_PERF.highResMarks value of the event if "HighRes" is passed as an argument', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd','highRes')).toEqual(1.6180339887);
        });

      });

      describe('when the client supports the Navigation Timing L1 spec but not High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = false;
        });

        it('returns the window.performance.timing value of the event by default', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "DOM" is passed as an argument', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd','DOM')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "HighRes" is passed as an argument', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd','highRes')).toEqual(1388578320000);
        });

      });

      describe('when the client does not support Navigation Timing', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = false;
          SurfNPerf._highResTime = false;
        });

        it('returns the SURF_N_PERF.marks value of the event', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd')).toEqual(1388578320001);
        });

      });

    });

    describe('#mark', function() {

      afterEach(function() {
        SurfNPerf._data.marks = {};
        SurfNPerf._data.highResMarks = {};
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = true;
        });

        it('stores the High Res value of now in the "highResMarks" data store for the event key', function() {
          SurfNPerf.mark('test');
          expect(SurfNPerf._data.highResMarks.test).toEqual(NOW_HIGH_RES);
        });

        it('stores the DOM timestamp value of now in the "marks" data store for the event key', function() {
          SurfNPerf.mark('test');
          expect(SurfNPerf._data.marks.test).toEqual(NOW_TS);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = false;
        });

        it('does not store the event key in the "highResMarks" data store', function() {
          SurfNPerf.mark('test');
          expect(SurfNPerf._data.highResMarks.test).not.toBeDefined();
        });

        it('stores the DOM timestamp value of now in the "marks" data store for the event key', function() {
          SurfNPerf.mark('test');
          expect(SurfNPerf._data.marks.test).toEqual(NOW_TS);
        });

      });

    });

    describe('#getMark', function() {

      var HIGH_RES_DATA = 2.71828,
          HIGH_RES_PROP = 1.41421,
          TS_DATA = 1388595600000,
          TS_PROP = 1388597400000;

      beforeEach(function() {
        SurfNPerf._data.highResMarks.test = HIGH_RES_DATA;
        SURF_N_PERF.highResMarks.test = HIGH_RES_PROP;
        SurfNPerf._data.marks.test = TS_DATA;
        SURF_N_PERF.marks.test = TS_PROP;
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = true;
        });

        describe('when the timeType attribute is not specified', function() {

          it('returns the highResMarks data for the event key if it exists', function() {
            expect(SurfNPerf.getMark('test')).toEqual(HIGH_RES_DATA);
          });

          it('returns the highResMarks property for the event key if it exists & the event key is not in the highRes data', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            expect(SurfNPerf.getMark('test')).toEqual(HIGH_RES_PROP);
          });

          it('returns the DOMTimeStamp data for the event key if it exists & no highRes data nor property exists for the event key', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            SURF_N_PERF.highResMarks.test = undefined;
            expect(SurfNPerf.getMark('test')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the highRes data nor the DOMTimestamp data', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            SURF_N_PERF.highResMarks.test = undefined;
            SurfNPerf._data.marks.test = undefined;
            expect(SurfNPerf.getMark('test')).toEqual(TS_PROP);
          });

        });

        describe('when the a DOMHighResTimeStamp mark is requested', function() {

          it('returns the highResMarks data for the event key if it exists', function() {
            expect(SurfNPerf.getMark('test','highRes')).toEqual(HIGH_RES_DATA);
          });

          it('returns the highResMarks property for the event key if it exists & the event key is not in the highRes data', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            expect(SurfNPerf.getMark('test','highRes')).toEqual(HIGH_RES_PROP);
          });

          it('returns the DOMTimeStamp data for the event key if it exists & no highRes data nor property exists for the event key', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            SURF_N_PERF.highResMarks.test = undefined;
            expect(SurfNPerf.getMark('test','highRes')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the highRes data nor the DOMTimeStamp data', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            SURF_N_PERF.highResMarks.test = undefined;
            SurfNPerf._data.marks.test = undefined;
            expect(SurfNPerf.getMark('test','highRes')).toEqual(TS_PROP);
          });

        });

      });

      describe('when the client does not support the High Resolution Time spec', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = false;
          /* highRes Marks won't exist: */
          SURF_N_PERF.highResMarks = {};
          SurfNPerf._data.highResMarks = {};
        });

        describe('when the timeType attribute is not specified', function() {

          it('returns the DOMTimeStamp data for the event key if it exists', function() {
            expect(SurfNPerf.getMark('test')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
            SurfNPerf._data.marks.test = undefined;
            expect(SurfNPerf.getMark('test')).toEqual(TS_PROP);
          });

        });

        describe('when the a DOMHighResTimeStamp mark is requested', function() {

          it('returns the DOMTimeStamp data for the event key if it exists', function() {
            expect(SurfNPerf.getMark('test','highRes')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
            SurfNPerf._data.marks.test = undefined;
            expect(SurfNPerf.getMark('test','highRes')).toEqual(TS_PROP);
          });

        });

      });

      describe('when the a DOMTimeStamp mark is requested', function() {

        it('returns the DOMTimeStamp marks data for the event key if it exists', function() {
          expect(SurfNPerf.getMark('test','DOM')).toEqual(TS_DATA);
        });

        it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
          SurfNPerf._data.marks.test = undefined;
          expect(SurfNPerf.getMark('test','DOM')).toEqual(TS_PROP);
        });

      });

    });

    describe('#updateEvent', function() {

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('can add data to a new event object', function() {
        expect(SurfNPerf._data.events.test).not.toBeDefined();

        SurfNPerf.updateEvent('test', 'foo', 'bar');

        expect(SurfNPerf._data.events.test).toEqual({foo: 'bar'});
      });

      it('can update data for an existing event object', function() {
        SurfNPerf._data.events.test = {foo: 'bar'};

        SurfNPerf.updateEvent('test', 'foo', 'baz');

        expect(SurfNPerf._data.events.test).toEqual({foo: 'baz'});
      });

      it('can add a new key/value to an existing event object', function() {
        SurfNPerf._data.events.test = {foo: 'baz'};

        SurfNPerf.updateEvent('test', 'key', 'value');

        expect(SurfNPerf._data.events.test).toEqual({foo: 'baz', key: 'value'});
      });

    });

    describe('#resetEvent', function() {

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('can add data to a new event object', function() {
        expect(SurfNPerf._data.events.test).not.toBeDefined();

        SurfNPerf.resetEvent('test', 'foo', 'bar');

        expect(SurfNPerf._data.events.test).toEqual({foo: 'bar'});
      });

      it('removes all existing key/value pairs of an existing event object & replaces them with the key/value argument', function() {
        SurfNPerf._data.events.test = {foo: 'bar'};

        SurfNPerf.resetEvent('test', 'key', 'value');

        expect(SurfNPerf._data.events.test).toEqual({key: 'value'});
      });

    });

    describe('#eventStart', function() {

      beforeEach(function() {
        SurfNPerf._data.events.test = {foo: 'bar'};
      });

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('clears out any previously existing properties of the event key', function() {
        SurfNPerf.eventStart('test');
        expect(SurfNPerf.getEventData('test', 'foo')).not.toBeDefined();
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = true;
          SurfNPerf.eventStart('test');
        });

        it('stores the current time as a DOMHighResTimeStamp for the "start" property of the event key', function() {
          expect(SurfNPerf.getEventData('test', 'start')).toEqual(NOW_HIGH_RES);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = false;
          SurfNPerf.eventStart('test');
        });

        it('stores the current time as a DOMTimeStamp for the "start" property of the event key', function() {
          expect(SurfNPerf.getEventData('test', 'start')).toEqual(NOW_TS);
        });

      });

    });

    describe('#eventEnd', function() {

      beforeEach(function() {
        SurfNPerf._data.events.test = {foo: 'bar'};
      });

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('preserves any previously existing properties of the event key', function() {
        SurfNPerf.eventEnd('test');
        expect(SurfNPerf.getEventData('test', 'foo')).toEqual('bar');
      });

      it('sets any extra event key/value pairs if passed in as options', function() {
        SurfNPerf.eventEnd('test', {foo:'bar', baz:'bat'});
        expect(SurfNPerf.getEventData('test', 'foo')).toEqual('bar');
        expect(SurfNPerf.getEventData('test', 'baz')).toEqual('bat');
      });

      it('ignores an option with an "end" key', function() {
        SurfNPerf.eventEnd('test', {end:'override attempt'});
        expect(SurfNPerf.getEventData('test', 'end')).not.toEqual('override attempt');
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = true;
          SurfNPerf.eventEnd('test');
        });

        it('stores the current time as a DOMHighResTimeStamp for the "end" property of the event key', function() {
          expect(SurfNPerf.getEventData('test', 'end')).toEqual(NOW_HIGH_RES);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._highResTime = false;
          SurfNPerf.eventEnd('test');
        });

        it('stores the current time as a DOMTimeStamp for the "end" property of the event key', function() {
          expect(SurfNPerf.getEventData('test', 'end')).toEqual(NOW_TS);
        });

      });

    });

    describe('#getEventData', function() {

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('returns the value of the key for the specified event key from the events data store', function() {
        SurfNPerf.updateEvent('test', 'foo', 'bar');

        expect(SurfNPerf.getEventData('test','foo')).toEqual('bar');
      });

      it('returns undefined if the event key does not exist in the events data store', function() {
        expect(SurfNPerf.getEventData('test','foo')).not.toBeDefined();
      });

    });

    describe('#eventDuration', function() {

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer by default', function() {
        SurfNPerf.updateEvent('test', 'start', 3.1);
        SurfNPerf.updateEvent('test', 'end', 8.4);

        expect(SurfNPerf.eventDuration('test')).toEqual(5);
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer if an option of 0 decimal places specified', function() {
        SurfNPerf.updateEvent('test', 'start', 3.1);
        SurfNPerf.updateEvent('test', 'end', 8.4);

        expect(SurfNPerf.eventDuration('test', {decimalPlaces: 0})).toEqual(5);
      });

      it('returns the difference between the start & end times for an event rounded to number of decimal places specified', function() {
        SurfNPerf.updateEvent('test', 'start', 3.14);
        SurfNPerf.updateEvent('test', 'end', 8.42);

        expect(SurfNPerf.eventDuration('test', {decimalPlaces: 2})).toEqual(5.28);
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer if a non-number value is specified', function() {
        SurfNPerf.updateEvent('test', 'start', 3.1);
        SurfNPerf.updateEvent('test', 'end', 8.4);

        expect(SurfNPerf.eventDuration('test', {decimalPlaces: 'foo'})).toEqual(5);
      });

    });

    describe('#setCustom', function() {

      afterEach(function() {
        SurfNPerf._data.custom = {};
      });

      it('stores the key/value pair in the "custom" data store', function() {
        SurfNPerf.setCustom('test', 'foo');

        expect(SurfNPerf._data.custom.test).toEqual('foo');
      });

    });

    describe('#getCustom', function() {

      afterEach(function() {
        SurfNPerf._data.custom = {};
      });

      it('retrieves the value for the specified key from the "custom" data store', function() {
        SurfNPerf.setCustom('test', 'foo');

        expect(SurfNPerf.getCustom('test')).toEqual('foo');
      });

    });

    describe('Navigation Timing duration calculations', function() {

      beforeEach(function() {
        spyOn(SurfNPerf, '_performanceTiming').andReturn({
          navigationStart: 1388595600000,
          fetchStart     : 1388595601000,
          requestStart   : 1388595602000,
          responseStart  : 1388595603000,
          responseEnd    : 1388595604000,
          loadEventEnd   : 1388595605000
        });
        SurfNPerf._data.marks = {
          appReady       : 1388595607010
        };
        SURF_N_PERF = {
          marks: {
            pageStart    : 1388595604025,
            loadEventEnd : 1388595605005
          },
          highResMarks: {
            loadEventEnd : 5000.0195
          }
        };
        SurfNPerf._data.highResMarks = {
          appReady       : 7000.0678
        };
      });

      describe('when the client supports the High Resolution Time spec (& should therefore support the Navigation Timing L1 spec)', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = true;
        });

        it('getNetworkLatency returns the difference between fetchStart & responseEnd for the page', function() {
          expect(SurfNPerf.getNetworkLatency()).toEqual(3000);
        });

        it('getProcessingLoadTime returns the difference between responseEnd & loadEventEnd for the page', function() {
          expect(SurfNPerf.getProcessingLoadTime()).toEqual(1000);
        });

        it('getFullRequestLoadTime returns the difference between navigationStart & loadEventEnd for the page', function() {
          expect(SurfNPerf.getFullRequestLoadTime()).toEqual(5000);
        });

      });

      describe('when the client supports the Navigation Timing L1 spec but not High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = false;
        });

        it('getNetworkLatency returns the difference between fetchStart & responseEnd for the page', function() {
          expect(SurfNPerf.getNetworkLatency()).toEqual(3000);
        });

        it('getProcessingLoadTime returns the difference between responseEnd & loadEventEnd for the page', function() {
          expect(SurfNPerf.getProcessingLoadTime()).toEqual(1000);
        });

        it('getFullRequestLoadTime returns the difference between navigationStart & loadEventEnd for the page', function() {
          expect(SurfNPerf.getFullRequestLoadTime()).toEqual(5000);
        });

      });

      describe('when the client does not support Navigation Timing', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = false;
          SurfNPerf._highResTime = false;
          /* highRes Marks won't exist: */
          SURF_N_PERF.highResMarks = {};
          SurfNPerf._data.highResMarks = {};
        });

        it('getNetworkLatency returns undefined', function() {
          expect(SurfNPerf.getNetworkLatency()).not.toBeDefined();
        });

        it('getProcessingLoadTime returns the difference between the semi-accurate pageStart & loadEventEnd timing events for the page', function() {
          expect(SurfNPerf.getProcessingLoadTime()).toEqual(980);
        });

        it('getFullRequestLoadTime returns undefined', function() {
          expect(SurfNPerf.getFullRequestLoadTime()).not.toBeDefined();
        });

      });

    });

  });
});