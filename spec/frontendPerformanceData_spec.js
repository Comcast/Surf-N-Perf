define('spec/frontendPerformanceData_spec', [
  'frontendPerformanceData'
], function(
  Perf
) {
  describe('Perf', function() {

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
        var a = Perf, b = Perf;
        expect(a).toBe(b);
      });
    });

    describe('#initialize', function() {

      beforeEach(function() {
        Perf.initialize();
      });

      it('sets the Performance API properties appropriately', function() {
        expect(Perf._navigationTiming).not.toBeNull();
        expect(Perf._highResTime).not.toBeNull();
      });

      it('ensures the FE_PERF_DATA global object exists', function() {
        expect(window.FE_PERF_DATA.marks).toBeDefined();
        expect(window.FE_PERF_DATA.highResMarks).toBeDefined();;
      });

      it('stores the URL pathname as "initialUrl"', function() {
        expect(Perf.getCustom('initialUrl')).toEqual(window.location.pathname);
      });

    });

    describe('#now', function() {

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          Perf._highResTime = true;
        });

        it('returns the current time as a DOMHighResTimeStamp by default', function() {
          expect(Perf.now()).toEqual(NOW_HIGH_RES);
        });

        it('returns the current time as a DOMHighResTimeStamp if "higRes" is passed as an argument', function() {
          expect(Perf.now('highRes')).toEqual(NOW_HIGH_RES);
        });

        it('returns the current time as a DOMTimeStamp if "DOM" is passed as an argument', function() {
          expect(Perf.now('DOM')).toEqual(NOW_TS);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          Perf._highResTime = false;
        });

        it('returns the current time', function() {
          expect(Perf.now()).toEqual(NOW_TS);
        });

      });

    });

    describe('#getTimingMark', function() {

      beforeEach(function() {
        spyOn(Perf, '_performanceTiming').andReturn({
          loadEventEnd: 1388578320000
        });
        FE_PERF_DATA = {
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
          Perf._navigationTiming = true;
          Perf._highResTime = true;
        });

        it('returns the window.performance.timing value of the event by default', function() {
          expect(Perf.getTimingMark('loadEventEnd')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "DOM" is passed as an argument', function() {
          expect(Perf.getTimingMark('loadEventEnd','DOM')).toEqual(1388578320000);
        });

        it('returns the FE_PERF_DATA.highResMarks value of the event if "HighRes" is passed as an argument', function() {
          expect(Perf.getTimingMark('loadEventEnd','highRes')).toEqual(1.6180339887);
        });

      });

      describe('when the client supports the Navigation Timing L1 spec but not High Resolution Time', function() {

        beforeEach(function() {
          Perf._navigationTiming = true;
          Perf._highResTime = false;
        });

        it('returns the window.performance.timing value of the event by default', function() {
          expect(Perf.getTimingMark('loadEventEnd')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "DOM" is passed as an argument', function() {
          expect(Perf.getTimingMark('loadEventEnd','DOM')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "HighRes" is passed as an argument', function() {
          expect(Perf.getTimingMark('loadEventEnd','highRes')).toEqual(1388578320000);
        });

      });

      describe('when the client does not support Navigation Timing', function() {

        beforeEach(function() {
          Perf._navigationTiming = false;
          Perf._highResTime = false;
        });

        it('returns the FE_PERF_DATA.marks value of the event', function() {
          expect(Perf.getTimingMark('loadEventEnd')).toEqual(1388578320001);
        });

      });

    });

    describe('#mark', function() {

      afterEach(function() {
        Perf._data.marks = {};
        Perf._data.highResMarks = {};
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          Perf._highResTime = true;
        });

        it('stores the High Res value of now in the "highResMarks" data store for the event key', function() {
          Perf.mark('test');
          expect(Perf._data.highResMarks.test).toEqual(NOW_HIGH_RES);
        });

        it('stores the DOM timestamp value of now in the "marks" data store for the event key', function() {
          Perf.mark('test');
          expect(Perf._data.marks.test).toEqual(NOW_TS);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          Perf._highResTime = false;
        });

        it('does not store the event key in the "highResMarks" data store', function() {
          Perf.mark('test');
          expect(Perf._data.highResMarks.test).not.toBeDefined();
        });

        it('stores the DOM timestamp value of now in the "marks" data store for the event key', function() {
          Perf.mark('test');
          expect(Perf._data.marks.test).toEqual(NOW_TS);
        });

      });

    });

    describe('#getMark', function() {

      var HIGH_RES_DATA = 2.71828,
          HIGH_RES_PROP = 1.41421,
          TS_DATA = 1388595600000,
          TS_PROP = 1388597400000;

      beforeEach(function() {
        Perf._data.highResMarks.test = HIGH_RES_DATA;
        FE_PERF_DATA.highResMarks.test = HIGH_RES_PROP;
        Perf._data.marks.test = TS_DATA;
        FE_PERF_DATA.marks.test = TS_PROP;
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          Perf._highResTime = true;
        });

        describe('when the timeType attribute is not specified', function() {

          it('returns the highResMarks data for the event key if it exists', function() {
            expect(Perf.getMark('test')).toEqual(HIGH_RES_DATA);
          });

          it('returns the highResMarks property for the event key if it exists & the event key is not in the highRes data', function() {
            Perf._data.highResMarks.test = undefined;
            expect(Perf.getMark('test')).toEqual(HIGH_RES_PROP);
          });

          it('returns the DOMTimeStamp data for the event key if it exists & no highRes data nor property exists for the event key', function() {
            Perf._data.highResMarks.test = undefined;
            FE_PERF_DATA.highResMarks.test = undefined;
            expect(Perf.getMark('test')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the highRes data nor the DOMTimestamp data', function() {
            Perf._data.highResMarks.test = undefined;
            FE_PERF_DATA.highResMarks.test = undefined;
            Perf._data.marks.test = undefined;
            expect(Perf.getMark('test')).toEqual(TS_PROP);
          });

        });

        describe('when the a DOMHighResTimeStamp mark is requested', function() {

          it('returns the highResMarks data for the event key if it exists', function() {
            expect(Perf.getMark('test','highRes')).toEqual(HIGH_RES_DATA);
          });

          it('returns the highResMarks property for the event key if it exists & the event key is not in the highRes data', function() {
            Perf._data.highResMarks.test = undefined;
            expect(Perf.getMark('test','highRes')).toEqual(HIGH_RES_PROP);
          });

          it('returns the DOMTimeStamp data for the event key if it exists & no highRes data nor property exists for the event key', function() {
            Perf._data.highResMarks.test = undefined;
            FE_PERF_DATA.highResMarks.test = undefined;
            expect(Perf.getMark('test','highRes')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the highRes data nor the DOMTimeStamp data', function() {
            Perf._data.highResMarks.test = undefined;
            FE_PERF_DATA.highResMarks.test = undefined;
            Perf._data.marks.test = undefined;
            expect(Perf.getMark('test','highRes')).toEqual(TS_PROP);
          });

        });

      });

      describe('when the client does not support the High Resolution Time spec', function() {

        beforeEach(function() {
          Perf._highResTime = false;
          /* highRes Marks won't exist: */
          FE_PERF_DATA.highResMarks = {};
          Perf._data.highResMarks = {};
        });

        describe('when the timeType attribute is not specified', function() {

          it('returns the DOMTimeStamp data for the event key if it exists', function() {
            expect(Perf.getMark('test')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
            Perf._data.marks.test = undefined;
            expect(Perf.getMark('test')).toEqual(TS_PROP);
          });

        });

        describe('when the a DOMHighResTimeStamp mark is requested', function() {

          it('returns the DOMTimeStamp data for the event key if it exists', function() {
            expect(Perf.getMark('test','highRes')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
            Perf._data.marks.test = undefined;
            expect(Perf.getMark('test','highRes')).toEqual(TS_PROP);
          });

        });

      });

      describe('when the a DOMTimeStamp mark is requested', function() {

        it('returns the DOMTimeStamp marks data for the event key if it exists', function() {
          expect(Perf.getMark('test','DOM')).toEqual(TS_DATA);
        });

        it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
          Perf._data.marks.test = undefined;
          expect(Perf.getMark('test','DOM')).toEqual(TS_PROP);
        });

      });

    });

    describe('#updateEvent', function() {

      afterEach(function() {
        Perf._data.events = {};
      });

      it('can add data to a new event object', function() {
        expect(Perf._data.events.test).not.toBeDefined();

        Perf.updateEvent('test', 'foo', 'bar');

        expect(Perf._data.events.test).toEqual({foo: 'bar'});
      });

      it('can update data for an existing event object', function() {
        Perf._data.events.test = {foo: 'bar'};

        Perf.updateEvent('test', 'foo', 'baz');

        expect(Perf._data.events.test).toEqual({foo: 'baz'});
      });

      it('can add a new key/value to an existing event object', function() {
        Perf._data.events.test = {foo: 'baz'};

        Perf.updateEvent('test', 'key', 'value');

        expect(Perf._data.events.test).toEqual({foo: 'baz', key: 'value'});
      });

    });

    describe('#resetEvent', function() {

      afterEach(function() {
        Perf._data.events = {};
      });

      it('can add data to a new event object', function() {
        expect(Perf._data.events.test).not.toBeDefined();

        Perf.resetEvent('test', 'foo', 'bar');

        expect(Perf._data.events.test).toEqual({foo: 'bar'});
      });

      it('removes all existing key/value pairs of an existing event object & replaces them with the key/value argument', function() {
        Perf._data.events.test = {foo: 'bar'};

        Perf.resetEvent('test', 'key', 'value');

        expect(Perf._data.events.test).toEqual({key: 'value'});
      });

    });

    describe('#eventStart', function() {

      beforeEach(function() {
        Perf._data.events.test = {foo: 'bar'};
      });

      afterEach(function() {
        Perf._data.events = {};
      });

      it('clears out any previously existing properties of the event key', function() {
        Perf.eventStart('test');
        expect(Perf.getEventData('test', 'foo')).not.toBeDefined();
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          Perf._highResTime = true;
          Perf.eventStart('test');
        });

        it('stores the current time as a DOMHighResTimeStamp for the "start" property of the event key', function() {
          expect(Perf.getEventData('test', 'start')).toEqual(NOW_HIGH_RES);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          Perf._highResTime = false;
          Perf.eventStart('test');
        });

        it('stores the current time as a DOMTimeStamp for the "start" property of the event key', function() {
          expect(Perf.getEventData('test', 'start')).toEqual(NOW_TS);
        });

      });

    });

    describe('#eventEnd', function() {

      beforeEach(function() {
        Perf._data.events.test = {foo: 'bar'};
      });

      afterEach(function() {
        Perf._data.events = {};
      });

      it('preserves any previously existing properties of the event key', function() {
        Perf.eventEnd('test');
        expect(Perf.getEventData('test', 'foo')).toEqual('bar');
      });

      it('sets any extra event key/value pairs if passed in as options', function() {
        Perf.eventEnd('test', {foo:'bar', baz:'bat'});
        expect(Perf.getEventData('test', 'foo')).toEqual('bar');
        expect(Perf.getEventData('test', 'baz')).toEqual('bat');
      });

      it('ignores an option with an "end" key', function() {
        Perf.eventEnd('test', {end:'override attempt'});
        expect(Perf.getEventData('test', 'end')).not.toEqual('override attempt');
      });

      describe('when the client supports the High Resolution Time spec', function() {

        beforeEach(function() {
          Perf._highResTime = true;
          Perf.eventEnd('test');
        });

        it('stores the current time as a DOMHighResTimeStamp for the "end" property of the event key', function() {
          expect(Perf.getEventData('test', 'end')).toEqual(NOW_HIGH_RES);
        });

      });

      describe('when the client does not support High Resolution Time', function() {

        beforeEach(function() {
          Perf._highResTime = false;
          Perf.eventEnd('test');
        });

        it('stores the current time as a DOMTimeStamp for the "end" property of the event key', function() {
          expect(Perf.getEventData('test', 'end')).toEqual(NOW_TS);
        });

      });

    });

    describe('#getEventData', function() {

      afterEach(function() {
        Perf._data.events = {};
      });

      it('returns the value of the key for the specified event key from the events data store', function() {
        Perf.updateEvent('test', 'foo', 'bar');

        expect(Perf.getEventData('test','foo')).toEqual('bar');
      });

      it('returns undefined if the event key does not exist in the events data store', function() {
        expect(Perf.getEventData('test','foo')).not.toBeDefined();
      });

    });

    describe('#eventDuration', function() {

      afterEach(function() {
        Perf._data.events = {};
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer by default', function() {
        Perf.updateEvent('test', 'start', 3.1);
        Perf.updateEvent('test', 'end', 8.4);

        expect(Perf.eventDuration('test')).toEqual(5);
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer if an option of 0 decimal places specified', function() {
        Perf.updateEvent('test', 'start', 3.1);
        Perf.updateEvent('test', 'end', 8.4);

        expect(Perf.eventDuration('test', {decimalPlaces: 0})).toEqual(5);
      });

      it('returns the difference between the start & end times for an event rounded to number of decimal places specified', function() {
        Perf.updateEvent('test', 'start', 3.14);
        Perf.updateEvent('test', 'end', 8.42);

        expect(Perf.eventDuration('test', {decimalPlaces: 2})).toEqual(5.28);
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer if a non-number value is specified', function() {
        Perf.updateEvent('test', 'start', 3.1);
        Perf.updateEvent('test', 'end', 8.4);

        expect(Perf.eventDuration('test', {decimalPlaces: 'foo'})).toEqual(5);
      });

    });

    describe('#setCustom', function() {

      afterEach(function() {
        Perf._data.custom = {};
      });

      it('stores the key/value pair in the "custom" data store', function() {
        Perf.setCustom('test', 'foo');

        expect(Perf._data.custom.test).toEqual('foo');
      });

    });

    describe('#getCustom', function() {

      afterEach(function() {
        Perf._data.custom = {};
      });

      it('retrieves the value for the specified key from the "custom" data store', function() {
        Perf.setCustom('test', 'foo');

        expect(Perf.getCustom('test')).toEqual('foo');
      });

    });

    describe('Navigation Timing duration calculations', function() {

      beforeEach(function() {
        spyOn(Perf, '_performanceTiming').andReturn({
          navigationStart: 1388595600000,
          fetchStart     : 1388595601000,
          requestStart   : 1388595602000,
          responseStart  : 1388595603000,
          responseEnd    : 1388595604000,
          loadEventEnd   : 1388595605000
        });
        Perf._data.marks = {
          appReady       : 1388595607010
        };
        FE_PERF_DATA = {
          marks: {
            pageStart    : 1388595604025,
            loadEventEnd : 1388595605005
          },
          highResMarks: {
            loadEventEnd : 5000.0195
          }
        };
        Perf._data.highResMarks = {
          appReady       : 7000.0678
        };
      });

      describe('when the client supports the High Resolution Time spec (& should therefore support the Navigation Timing L1 spec)', function() {

        beforeEach(function() {
          Perf._navigationTiming = true;
          Perf._highResTime = true;
        });

        it('getNetworkLatency returns the difference between fetchStart & responseEnd for the page', function() {
          expect(Perf.getNetworkLatency()).toEqual(3000);
        });

        it('getProcessingLoadTime returns the difference between responseEnd & loadEventEnd for the page', function() {
          expect(Perf.getProcessingLoadTime()).toEqual(1000);
        });

        it('getFullRequestLoadTime returns the difference between navigationStart & loadEventEnd for the page', function() {
          expect(Perf.getFullRequestLoadTime()).toEqual(5000);
        });

      });

      describe('when the client supports the Navigation Timing L1 spec but not High Resolution Time', function() {

        beforeEach(function() {
          Perf._navigationTiming = true;
          Perf._highResTime = false;
        });

        it('getNetworkLatency returns the difference between fetchStart & responseEnd for the page', function() {
          expect(Perf.getNetworkLatency()).toEqual(3000);
        });

        it('getProcessingLoadTime returns the difference between responseEnd & loadEventEnd for the page', function() {
          expect(Perf.getProcessingLoadTime()).toEqual(1000);
        });

        it('getFullRequestLoadTime returns the difference between navigationStart & loadEventEnd for the page', function() {
          expect(Perf.getFullRequestLoadTime()).toEqual(5000);
        });

      });

      describe('when the client does not support Navigation Timing', function() {

        beforeEach(function() {
          Perf._navigationTiming = false;
          Perf._highResTime = false;
          /* highRes Marks won't exist: */
          FE_PERF_DATA.highResMarks = {};
          Perf._data.highResMarks = {};
        });

        it('getNetworkLatency returns undefined', function() {
          expect(Perf.getNetworkLatency()).not.toBeDefined();
        });

        it('getProcessingLoadTime returns the difference between the semi-accurate pageStart & loadEventEnd timing events for the page', function() {
          expect(Perf.getProcessingLoadTime()).toEqual(980);
        });

        it('getFullRequestLoadTime returns undefined', function() {
          expect(Perf.getFullRequestLoadTime()).not.toBeDefined();
        });

      });

    });

  });
});