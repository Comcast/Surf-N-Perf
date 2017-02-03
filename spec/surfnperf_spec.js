define('spec/surfnperf_spec', [
  'surfnperf'
], function(
  SurfNPerf
) {
  describe('SurfNPerf', function() {

    var NOW_TS = 1388595600000, // Wed Jan 01 2014 12:00:00 GMT-0500 (EST)
      NOW_HIGH_RES = 3.1415926;

    // Object.assign() Polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if(typeof Object.assign != 'function') {
      Object.assign = function(target, varArgs) { // .length of function is 2
        'use strict';
        if(target == null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for(var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if(nextSource != null) { // Skip over if undefined or null
            for(var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if(Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }

    beforeEach(function() {
      if(typeof window.performance === 'undefined') {
        window.performance = {
          now: function() {
            return NOW_HIGH_RES;
          },
          timing: {}
        };
      }
      spyOn(window.performance, 'now').andReturn(NOW_HIGH_RES);
      spyOn(Date, 'now').andReturn(NOW_TS);
    });

    describe('Singleton Behavior', function() {
      it('is only instantiated once, even if the library is attempted to be instantiated more than once (as good singletons do)', function() {
        var a = SurfNPerf,
          b = SurfNPerf;
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
        expect(SurfNPerf._userTiming).not.toBeNull();
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

    describe('#performanceTiming', function() {
      it('returns a reference to window.performance.timing if the browser supports it, otherwise an empty object', function() {
        if(window.performance.timing) {
          expect(SurfNPerf.performanceTiming()).toEqual(window.performance.timing);
        } else {
          expect(SurfNPerf.performanceTiming()).toEqual({});
        }
      });

      it('returns an empty object if the client does not support the Navigation Timing L1 spec', function() {
        SurfNPerf._navigationTiming = false;
        expect(SurfNPerf.performanceTiming()).toEqual({});
      });
    });

    describe('#getTimingMark', function() {

      beforeEach(function() {
        spyOn(SurfNPerf, 'performanceTiming').andReturn({
          navigationStart: 1388578319996,
          fetchStart: 1388578319996,
          requestStart: 1388578319998,
          domComplete: 1388578319999,
          loadEventEnd: 1388578320000
        });
        SURF_N_PERF = {
          marks: {
            pageStart: 1388578319000,
            loadEventEnd: 1388578320001
          },
          highResMarks: {
            loadEventEnd: 3.6180339887
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
          expect(SurfNPerf.getTimingMark('loadEventEnd', 'DOM')).toEqual(1388578320000);
        });

        it('returns the SURF_N_PERF.highResMarks value of the event if "HighRes" is passed as an argument', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd', 'highRes')).toEqual(3.6180339887);
        });

        it('returns the SURF_N_PERF.highResMarks value for "loadEventEnd" if "loadEventEnd" & "HighRes" are passed as arguments', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd', 'highRes')).toEqual(3.6180339887);
        });

        it('returns the SURF_N_PERF.highResMarks value for "loadEventEnd" minus difference between the event Navigation Timing mark & the loadEventEnd Navigation Timing mark if "HighRes" is an argument', function() {
          expect(SurfNPerf.getTimingMark('requestStart', 'highRes')).toEqual(1.6180339887);
          expect(SurfNPerf.getTimingMark('domComplete', 'highRes')).toEqual(2.6180339887);
        });

        it('returns 0 if the SURF_N_PERF.highResMarks value for "loadEventEnd" minus difference between the event Navigation Timing mark & the loadEventEnd Navigation Timing mark is less than 0 if "HighRes" is an argument', function() {
          expect(SurfNPerf.getTimingMark('navigationStart', 'highRes')).toEqual(0);
          expect(SurfNPerf.getTimingMark('fetchStart', 'highRes')).toEqual(0);
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
          expect(SurfNPerf.getTimingMark('loadEventEnd', 'DOM')).toEqual(1388578320000);
        });

        it('returns the window.performance.timing value of the event if "HighRes" is passed as an argument', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd', 'highRes')).toEqual(1388578320000);
        });

      });

      describe('when the client does not support Navigation Timing', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = false;
          SurfNPerf._highResTime = false;
          /* highRes Marks won't exist: */
          SURF_N_PERF.highResMarks = {};
        });

        it('returns the SURF_N_PERF.marks value of the event', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd')).toEqual(1388578320001);
        });

        it('returns the pageStart mark if the requested Navigation Timing mark is domLoading or earlier', function() {
          expect(SurfNPerf.getTimingMark('navigationStart')).toEqual(1388578319000);
        });

        it('returns the loadEventEnd mark if the requested Navigation Timing mark is domInteractive or later', function() {
          expect(SurfNPerf.getTimingMark('loadEventEnd')).toEqual(1388578320001);
        });

      });

    });

    describe('#userTiming', function() {
      it('returns a reference to window.performance if the browser supports User Timing, otherwise an empty object', function() {
        if(window.performance.mark && window.performance.measure && window.performance.getEntriesByName) {
          expect(SurfNPerf.userTiming()).toEqual(window.performance);
        } else {
          expect(SurfNPerf.userTiming()).toEqual({});
        }
      });

      it('returns an empty object if the client does not support the Navigation Timing L1 spec', function() {
        SurfNPerf._userTiming = false;
        expect(SurfNPerf.userTiming()).toEqual({});
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

      describe('User Timing', function() {

        var markSpy;

        beforeEach(function() {
          markSpy = jasmine.createSpy();
          spyOn(SurfNPerf, 'userTiming').andReturn({
            mark: markSpy
          });
        });

        describe('when the client supports the User Timing spec', function() {

          beforeEach(function() {
            SurfNPerf._userTiming = true;
          });

          it('sets a PerformanceMark for the event key', function() {
            SurfNPerf.mark('test');
            expect(markSpy).toHaveBeenCalledWith('test');
          });

        });

        describe('when the client does not support User Timing', function() {

          beforeEach(function() {
            SurfNPerf._userTiming = false;
          });

          it('does not set a PerformanceMark for the event key', function() {
            SurfNPerf.mark('test');
            expect(markSpy).not.toHaveBeenCalled();
          });

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
            expect(SurfNPerf.getMark('test', 'highRes')).toEqual(HIGH_RES_DATA);
          });

          it('returns the highResMarks property for the event key if it exists & the event key is not in the highRes data', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            expect(SurfNPerf.getMark('test', 'highRes')).toEqual(HIGH_RES_PROP);
          });

          it('returns the DOMTimeStamp data for the event key if it exists & no highRes data nor property exists for the event key', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            SURF_N_PERF.highResMarks.test = undefined;
            expect(SurfNPerf.getMark('test', 'highRes')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the highRes data nor the DOMTimeStamp data', function() {
            SurfNPerf._data.highResMarks.test = undefined;
            SURF_N_PERF.highResMarks.test = undefined;
            SurfNPerf._data.marks.test = undefined;
            expect(SurfNPerf.getMark('test', 'highRes')).toEqual(TS_PROP);
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
            expect(SurfNPerf.getMark('test', 'highRes')).toEqual(TS_DATA);
          });

          it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
            SurfNPerf._data.marks.test = undefined;
            expect(SurfNPerf.getMark('test', 'highRes')).toEqual(TS_PROP);
          });

        });

      });

      describe('when the a DOMTimeStamp mark is requested', function() {

        it('returns the DOMTimeStamp marks data for the event key if it exists', function() {
          expect(SurfNPerf.getMark('test', 'DOM')).toEqual(TS_DATA);
        });

        it('returns the DOMTimeStamp property for the event key if it exists & the event key is not in the DOMTimeStamp data', function() {
          SurfNPerf._data.marks.test = undefined;
          expect(SurfNPerf.getMark('test', 'DOM')).toEqual(TS_PROP);
        });

      });

    });

    describe('#clearMarks', function() {

      var utClearMarksSpy,
        fullyLoadedMark = 1388595607010,
        fullyLoadedHighResMark = 7000.0678,
        loadEventEndMark = 1388595605005,
        loadEventEndHighResMark = 5000.0195,
        originalDataMarks = {
          mark_above_the_fold: 1388595606910,
          mark_fully_loaded: fullyLoadedMark
        },
        originalDataHighResMarks = {
          mark_above_the_fold: 6905.0234,
          mark_fully_loaded: fullyLoadedHighResMark
        },
        originalMarks = {
          pageStart: 1388595604025,
          firstPaintFrame: 1388595604050,
          loadEventEnd: loadEventEndMark
        },
        originalHighResMarks = {
          pageStart: 12.3456,
          firstPaintFrame: 45.6789,
          loadEventEnd: loadEventEndHighResMark
        };

      beforeEach(function() {
        utClearMarksSpy = jasmine.createSpy();
        spyOn(SurfNPerf, 'userTiming').andReturn({
          clearMarks: utClearMarksSpy
        });
        SurfNPerf._data.marks = Object.assign({}, originalDataMarks);
        SurfNPerf._data.highResMarks = Object.assign({}, originalDataHighResMarks);
        SURF_N_PERF = {
          marks: Object.assign({}, originalMarks),
          highResMarks: Object.assign({}, originalHighResMarks)
        };
      });

      it('does nothing with User Timing marks if the API is not supported', function() {
        SurfNPerf._userTiming = false;
        SurfNPerf.clearMarks();
        SurfNPerf.clearMarks('mark_fully_loaded');
        SurfNPerf.clearMarks('not_a_real_mark');
        expect(utClearMarksSpy).not.toHaveBeenCalled();
      });

      describe('calling clearMarks with no arguments', function() {
        beforeEach(function() {
          SurfNPerf._userTiming = true;
          SurfNPerf.clearMarks();
        });

        it('clears all User Timing marks if the API is supported', function() {
          expect(utClearMarksSpy).toHaveBeenCalledWith(undefined);
        });

        it('clears all "highResMarks" (except for loadEventEnd)', function() {
          expect(SurfNPerf._data.highResMarks).toEqual({});
          expect(SURF_N_PERF.highResMarks).toEqual({
            loadEventEnd: loadEventEndHighResMark
          });
        });

        it('clears all "marks" (except for loadEventEnd)', function() {
          expect(SurfNPerf._data.marks).toEqual({});
          expect(SURF_N_PERF.marks).toEqual({
            loadEventEnd: loadEventEndMark
          });
        });
      });

      describe('calling clearMarks with no arguments before loadEventEnd is set', function() {
        beforeEach(function() {
          delete window.SURF_N_PERF.highResMarks['loadEventEnd'];
          delete window.SURF_N_PERF.marks['loadEventEnd'];
          SurfNPerf.clearMarks();
        });

        it('clears all "highResMarks"', function() {
          expect(SurfNPerf._data.highResMarks).toEqual({});
          expect(SURF_N_PERF.highResMarks).toEqual({});
        });

        it('clears all "marks"', function() {
          expect(SurfNPerf._data.marks).toEqual({});
          expect(SURF_N_PERF.marks).toEqual({});
        });
      });

      describe('calling clearMarks with a mark that exists', function() {
        beforeEach(function() {
          SurfNPerf._userTiming = true;
          SurfNPerf.clearMarks('mark_above_the_fold');
        });

        it('clears that User Timing marks if the API is supported', function() {
          SurfNPerf._userTiming = true;
          expect(utClearMarksSpy).toHaveBeenCalledWith('mark_above_the_fold');
        });

        it('deletes that "highResMark"', function() {
          expect(SurfNPerf._data.highResMarks).toEqual({
            mark_fully_loaded: fullyLoadedHighResMark
          });
          expect(SURF_N_PERF.highResMarks).toEqual(originalHighResMarks);
        });

        it('deletes that "mark"', function() {
          expect(SurfNPerf._data.marks).toEqual({
            mark_fully_loaded: fullyLoadedMark
          });
          expect(SURF_N_PERF.marks).toEqual(originalMarks);
        });
      });

      describe('calling clearMarks with a mark that does not exist', function() {
        beforeEach(function() {
          SurfNPerf.clearMarks('not_a_real_mark');
        });

        it('has no effect on "highResMarks"', function() {
          expect(SurfNPerf._data.highResMarks).toEqual(originalDataHighResMarks);
          expect(SURF_N_PERF.highResMarks).toEqual(originalHighResMarks);
        });

        it('has no effect on "marks"', function() {
          expect(SurfNPerf._data.marks).toEqual(originalDataMarks);
          expect(SURF_N_PERF.marks).toEqual(originalMarks);
        });
      });

      describe('calling clearMarks with "loadEventEnd"', function() {
        beforeEach(function() {
          SurfNPerf.clearMarks('loadEventEnd');
        });

        it('has no effect on "highResMarks"', function() {
          expect(SurfNPerf._data.highResMarks).toEqual(originalDataHighResMarks);
          expect(SURF_N_PERF.highResMarks).toEqual(originalHighResMarks);
        });

        it('has no effect on "marks"', function() {
          expect(SurfNPerf._data.marks).toEqual(originalDataMarks);
          expect(SURF_N_PERF.marks).toEqual(originalMarks);
        });
      });

    });

    describe('#_setMeasure', function() {

      it('calls the User Timing #mark method with the appropriate name and marks', function() {
        var measureSpy = jasmine.createSpy();
        spyOn(SurfNPerf, 'userTiming').andReturn({
          measure: measureSpy
        });
        SurfNPerf._setMeasure('markA', 'markB');
        expect(measureSpy).toHaveBeenCalledWith('_SNP_markA_TO_markB', 'markA', 'markB');
      });

      describe('when at least one of the marks/events being measured does not exist yet', function() {

        beforeEach(function() {
          spyOn(window.console, 'error');
        });

        it('logs the error message to the console if the exception contains one', function() {
          spyOn(SurfNPerf, 'userTiming').andThrow({
            message: 'exception message'
          });
          SurfNPerf._setMeasure('markA', 'markZ');
          expect(window.console.error).toHaveBeenCalledWith('Surf-N-Perf Exception:', 'exception message');
        });

        it('logs a specific error message to the console if the exception does not contain a message', function() {
          spyOn(SurfNPerf, 'userTiming').andThrow('an exception');
          SurfNPerf._setMeasure('markA', 'markZ');
          expect(window.console.error).toHaveBeenCalledWith('Surf-N-Perf Exception: at least one of these events/marks is not available yet', 'markA', 'markZ');
        });

      });

    });

    describe('#_getMeasureDuration', function() {

      var getEntriesByNameSpy;

      beforeEach(function() {
        getEntriesByNameSpy = jasmine.createSpy().andReturn([{
          duration: 100
        }]);
        spyOn(SurfNPerf, 'userTiming').andReturn({
          getEntriesByName: getEntriesByNameSpy
        });
      });

      it('calls the User Timing #getEntriesByName method with the appropriate name', function() {
        SurfNPerf._getMeasureDuration('markA', 'markB');
        expect(getEntriesByNameSpy).toHaveBeenCalledWith('_SNP_markA_TO_markB');
      });

      it('returns the duration of the first item in the #getEntriesByName returned array if it exists', function() {
        expect(SurfNPerf._getMeasureDuration('markA', 'markB')).toEqual(100);
      });

      it('returns undefined if #getEntriesByName returns an empty array', function() {
        getEntriesByNameSpy.andReturn([]);
        expect(SurfNPerf._getMeasureDuration('markA', 'markB')).toBeUndefined();
      });

    });

    describe('#duration', function() {

      beforeEach(function() {
        spyOn(SurfNPerf, 'performanceTiming').andReturn({
          navigationStart: 1388595600000,
          fetchStart: 1388595600001,
          loadEventEnd: 1388595605000
        });
        SurfNPerf._data.marks = {
          mark_above_the_fold: 1388595606910,
          mark_fully_loaded: 1388595607010
        };
        SurfNPerf._data.highResMarks = {
          mark_above_the_fold: 6905.0234,
          mark_fully_loaded: 7000.0678
        };
        SURF_N_PERF = {
          marks: {
            pageStart: 1388595604025,
            loadEventEnd: 1388595605005
          },
          highResMarks: {
            pageStart: 12.3456,
            loadEventEnd: 5000.0195
          }
        };
      });

      describe('when the client supports the User Timing spec (& should therefore support both High Resolution Time & Navigation Timing L1)', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = true;
          SurfNPerf._userTiming = true;

          spyOn(SurfNPerf, '_setMeasure');
          spyOn(SurfNPerf, '_getMeasureDuration').andReturn(123.456789);
        });

        it('calls #_setMeasure for the 2 marks', function() {
          SurfNPerf.duration('markA', 'markB');
          expect(SurfNPerf._setMeasure).toHaveBeenCalledWith('markA', 'markB');
        });

        it('returns the User Timing calculation of the duration between the 2 marks', function() {
          expect(SurfNPerf.duration('markA', 'markB')).toEqual(123);
        });

        describe('decimal place rounding', function() {

          it('rounds to the nearest integer by default', function() {
            expect(SurfNPerf.duration('markA', 'markB')).toEqual(123);
          });

          it('rounds to the nearest integer if an option of 0 decimal places specified', function() {
            expect(SurfNPerf.duration('markA', 'markB', {
              decimalPlaces: 0
            })).toEqual(123);
          });

          it('rounds to the number of decimal places specified', function() {
            expect(SurfNPerf.duration('markA', 'markB', {
              decimalPlaces: 2
            })).toEqual(123.46);
          });

          it('rounds to the nearest integer if a non-number value is specified', function() {
            expect(SurfNPerf.duration('markA', 'markB', {
              decimalPlaces: 'foo'
            })).toEqual(123);
          });

          it('returns NaN if at least one of the marks does not exist', function() {
            SurfNPerf._getMeasureDuration.andReturn(undefined);
            expect(isNaN(SurfNPerf.duration('markA', 'markZ', {
              decimalPlaces: 'foo'
            }))).toEqual(true);
          });

        });

      });

      describe('when the client supports the High Resolution Time spec (& should therefore support the Navigation Timing L1 spec)', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = true;
          SurfNPerf._userTiming = false;
        });

        it('can calculate the duration between 2 Navigation Timing marks', function() {
          expect(SurfNPerf.duration('navigationStart', 'loadEventEnd')).toEqual(5000);
        });

        it('can calculate the high resolution duration between 2 user marks', function() {
          expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded', {
            decimalPlaces: 4
          })).toEqual(95.0444);
        });

        it('can calculate the high resolution duration between a Navigation Timing mark and a user mark', function() {
          expect(SurfNPerf.duration('fetchStart', 'mark_fully_loaded', {
            decimalPlaces: 4
          })).toEqual(6999.0483);
        });

        it('can calculate the high resolution duration between the navigationStart Navigation Timing mark and a user mark as the high resolution value of the user mark', function() {
          expect(SurfNPerf.duration('navigationStart', 'mark_above_the_fold', {
            decimalPlaces: 4
          })).toEqual(6905.0234);
        });

        describe('decimal place rounding', function() {

          it('rounds to the nearest integer by default', function() {
            expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded')).toEqual(95);
          });

          it('rounds to the nearest integer if an option of 0 decimal places specified', function() {
            expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded', {
              decimalPlaces: 0
            })).toEqual(95);
          });

          it('rounds to the number of decimal places specified', function() {
            expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded', {
              decimalPlaces: 2
            })).toEqual(95.04);
          });

          it('rounds to the nearest integer if a non-number value is specified', function() {
            expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded', {
              decimalPlaces: 'foo'
            })).toEqual(95);
          });

        });

      });

      describe('when the client supports the Navigation Timing L1 spec but not High Resolution Time', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = false;
          SurfNPerf._userTiming = false;
        });

        it('can calculate the duration between 2 Navigation Timing marks', function() {
          expect(SurfNPerf.duration('navigationStart', 'loadEventEnd')).toEqual(5000);
        });

        it('can calculate the duration between 2 user marks', function() {
          expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded')).toEqual(100);
        });

        it('can calculate the duration between a Navigation Timing mark and a user mark', function() {
          expect(SurfNPerf.duration('navigationStart', 'mark_fully_loaded')).toEqual(7010);
        });

      });

      describe('when the client does not support Navigation Timing', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = false;
          SurfNPerf._highResTime = false;
          SurfNPerf._userTiming = false;
          /* highRes Marks won't exist: */
          SURF_N_PERF.highResMarks = {};
          SurfNPerf._data.highResMarks = {};
        });

        it('returns the duration between the pageStart & loadEventEnd user marks when attempting to calculate the duration between a Navigation Timing mark of domLoading or earlier and a Navigation Timing mark of domInteractive or later', function() {
          expect(SurfNPerf.duration('navigationStart', 'loadEventEnd')).toEqual(980);
        });

        it('returns 0 when attempting to calculate the duration between 2 Navigation Timing marks of domLoading or earlier', function() {
          expect(SurfNPerf.duration('navigationStart', 'domLoading')).toEqual(0);
        });

        it('returns 0 when attempting to calculate the duration between 2 Navigation Timing marks of domInteractive or later', function() {
          expect(SurfNPerf.duration('domInteractive', 'loadEventEnd')).toEqual(0);
        });

        it('can calculate the duration between 2 user marks', function() {
          expect(SurfNPerf.duration('mark_above_the_fold', 'mark_fully_loaded')).toEqual(100);
        });

        it('uses the pageStart mark to calculate the duration between a Navigation Timing mark of domLoading or earlier and a user mark', function() {
          expect(SurfNPerf.duration('navigationStart', 'mark_above_the_fold')).toEqual(2885);
        });

        it('uses the loadEventEnd mark to calculate the duration between a Navigation Timing mark of domInteractive or later and a user mark', function() {
          expect(SurfNPerf.duration('loadEventEnd', 'mark_fully_loaded')).toEqual(2005);
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

        expect(SurfNPerf._data.events.test).toEqual({
          foo: 'bar'
        });
      });

      it('can update data for an existing event object', function() {
        SurfNPerf._data.events.test = {
          foo: 'bar'
        };

        SurfNPerf.updateEvent('test', 'foo', 'baz');

        expect(SurfNPerf._data.events.test).toEqual({
          foo: 'baz'
        });
      });

      it('can update data for an existing event object that has a falsy value', function() {
        SurfNPerf._data.events.test = {
          foo: false
        };

        SurfNPerf.updateEvent('test', 'foo', 'baz');

        expect(SurfNPerf._data.events.test).toEqual({
          foo: 'baz'
        });
      });

      it('can add a new key/value to an existing event object', function() {
        SurfNPerf._data.events.test = {
          foo: 'baz'
        };

        SurfNPerf.updateEvent('test', 'key', 'value');

        expect(SurfNPerf._data.events.test).toEqual({
          foo: 'baz',
          key: 'value'
        });
      });

    });

    describe('#resetEvent', function() {

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('can add data to a new event object', function() {
        expect(SurfNPerf._data.events.test).not.toBeDefined();

        SurfNPerf.resetEvent('test', 'foo', 'bar');

        expect(SurfNPerf._data.events.test).toEqual({
          foo: 'bar'
        });
      });

      it('removes all existing key/value pairs of an existing event object & replaces them with the key/value argument', function() {
        SurfNPerf._data.events.test = {
          foo: 'bar'
        };

        SurfNPerf.resetEvent('test', 'key', 'value');

        expect(SurfNPerf._data.events.test).toEqual({
          key: 'value'
        });
      });

    });

    describe('#eventStart', function() {

      beforeEach(function() {
        SurfNPerf._data.events.test = {
          foo: 'bar'
        };
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
        SurfNPerf._data.events.test = {
          foo: 'bar'
        };
      });

      afterEach(function() {
        SurfNPerf._data.events = {};
      });

      it('preserves any previously existing properties of the event key', function() {
        SurfNPerf.eventEnd('test');
        expect(SurfNPerf.getEventData('test', 'foo')).toEqual('bar');
      });

      it('sets any extra event key/value pairs if passed in as options', function() {
        SurfNPerf.eventEnd('test', {
          foo: 'bar',
          baz: 'bat'
        });
        expect(SurfNPerf.getEventData('test', 'foo')).toEqual('bar');
        expect(SurfNPerf.getEventData('test', 'baz')).toEqual('bat');
      });

      it('ignores an option with an "end" key', function() {
        SurfNPerf.eventEnd('test', {
          end: 'override attempt'
        });
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

        expect(SurfNPerf.getEventData('test', 'foo')).toEqual('bar');
      });

      it('returns undefined if the event key does not exist in the events data store', function() {
        expect(SurfNPerf.getEventData('test', 'foo')).not.toBeDefined();
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

        expect(SurfNPerf.eventDuration('test', {
          decimalPlaces: 0
        })).toEqual(5);
      });

      it('returns the difference between the start & end times for an event rounded to number of decimal places specified', function() {
        SurfNPerf.updateEvent('test', 'start', 3.14);
        SurfNPerf.updateEvent('test', 'end', 8.42);

        expect(SurfNPerf.eventDuration('test', {
          decimalPlaces: 2
        })).toEqual(5.28);
      });

      it('returns the difference between the start & end times for an event rounded to nearest integer if a non-number value is specified', function() {
        SurfNPerf.updateEvent('test', 'start', 3.1);
        SurfNPerf.updateEvent('test', 'end', 8.4);

        expect(SurfNPerf.eventDuration('test', {
          decimalPlaces: 'foo'
        })).toEqual(5);
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
        spyOn(SurfNPerf, 'performanceTiming').andReturn({
          navigationStart: 1388595600000,
          fetchStart: 1388595601000,
          connectEnd: 1388595601900,
          requestStart: 1388595602000,
          responseStart: 1388595603000,
          responseEnd: 1388595604000,
          loadEventEnd: 1388595605000
        });
        SurfNPerf._data.marks = {
          appReady: 1388595607010
        };
        SURF_N_PERF = {
          marks: {
            pageStart: 1388595604025,
            loadEventEnd: 1388595605005
          },
          highResMarks: {
            loadEventEnd: 5000.0195
          }
        };
        SurfNPerf._data.highResMarks = {
          appReady: 7000.0678
        };
      });

      describe('when the client supports the High Resolution Time spec (& should therefore support the Navigation Timing L1 spec)', function() {

        beforeEach(function() {
          SurfNPerf._navigationTiming = true;
          SurfNPerf._highResTime = true;
        });

        it('getNetworkTime returns the difference between fetchStart & connectEnd for the page', function() {
          expect(SurfNPerf.getNetworkTime()).toEqual(900);
        });

        it('getServerTime returns the difference between requestStart & responseEnd for the page', function() {
          expect(SurfNPerf.getServerTime()).toEqual(2000);
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

        it('getNetworkTime returns the difference between fetchStart & connectEnd for the page', function() {
          expect(SurfNPerf.getNetworkTime()).toEqual(900);
        });

        it('getServerTime returns the difference between requestStart & responseEnd for the page', function() {
          expect(SurfNPerf.getServerTime()).toEqual(2000);
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

        it('getNetworkTime returns 0', function() {
          expect(SurfNPerf.getNetworkTime()).toEqual(0);
        });

        it('getServerTime returns 0', function() {
          expect(SurfNPerf.getServerTime()).toEqual(0);
        });

        it('getNetworkLatency returns 0', function() {
          expect(SurfNPerf.getNetworkLatency()).toEqual(0);
        });

        it('getProcessingLoadTime returns the difference between the semi-accurate pageStart & loadEventEnd timing events for the page', function() {
          expect(SurfNPerf.getProcessingLoadTime()).toEqual(980);
        });

        it('getFullRequestLoadTime returns the same value as #getProcessingLoadTime', function() {
          expect(SurfNPerf.getFullRequestLoadTime()).toEqual(980);
        });

      });

    });


    describe('#chromeLoadTimes', function() {
      it('returns a reference to window.chrome.loadTimes() if the browser supports it, otherwise undefined', function() {
        if(window.chrome && window.chrome.loadTimes) {
          expect(SurfNPerf.chromeLoadTimes()).toEqual(window.chrome.loadTimes());
        } else {
          expect(SurfNPerf.chromeLoadTimes()).toEqual(undefined);
        }
      });
    });

    describe('#msFirstPaint', function() {
      it('returns a reference to window.performance.timing.msFirstPaint if the browser supports it, otherwise undefined', function() {
        if(window.performance && window.performance.timing && window.performance.timing.msFirstPaint) {
          expect(SurfNPerf.msFirstPaint()).toEqual(window.performance.timing.msFirstPaint);
        } else {
          expect(SurfNPerf.msFirstPaint()).toEqual(undefined);
        }
      });
    });

    describe('#getFirstPaint', function() {
      beforeEach(function() {
        SurfNPerf._navigationTiming = true;
        spyOn(SurfNPerf, 'performanceTiming').andReturn({
          navigationStart: 1388595600000
        });
      });

      describe('when the client is using Chrome', function() {
        it('returns the time to first paint relative to navigation start time', function() {
          spyOn(SurfNPerf, 'chromeLoadTimes').andReturn({
            firstPaintTime: 1388595601.000123
          });
          spyOn(SurfNPerf, 'msFirstPaint').andReturn(undefined);

          expect(SurfNPerf.getFirstPaint()).toEqual(1000);
        });
      });

      describe('when the client is using IE/Edge', function() {
        it('returns the time to first paint relative to navigation start time', function() {
          spyOn(SurfNPerf, 'msFirstPaint').andReturn(1388595601005);
          spyOn(SurfNPerf, 'chromeLoadTimes').andReturn(undefined);

          expect(SurfNPerf.getFirstPaint()).toEqual(1005);
        });
      });

      describe('when the client is using browser without Time to First Paint built in support', function() {
        it('returns null since the browser does not have built in support', function() {
          spyOn(SurfNPerf, 'chromeLoadTimes').andReturn(undefined);
          spyOn(SurfNPerf, 'msFirstPaint').andReturn(undefined);

          expect(SurfNPerf.getFirstPaint()).toEqual(null);
        });
      });
    });

    describe("#_supportsRequestAnimationFrame", function() {
      it('returns a boolean based on the existence of window.requestAnimationFrame', function() {
        expect(SurfNPerf._supportsRequestAnimationFrame()).toEqual(!!window.requestAnimationFrame);
      });
    });

    describe("#getFirstPaintFrame", function() {
      describe('when the client does not support window.requestAnimationFrame', function() {
        it('returns null', function() {
          spyOn(SurfNPerf, '_supportsRequestAnimationFrame').andReturn(false);
          expect(SurfNPerf.getFirstPaintFrame()).toEqual(null);
        });
      });

      describe('when the client supports window.requestAnimationFrame but it has not yet been called', function() {
        it('returns undefined', function() {
          SurfNPerf._navigationTiming = true;
          spyOn(SurfNPerf, '_supportsRequestAnimationFrame').andReturn(true);

          if(!window.requestAnimationFrame) {
            window.requestAnimationFrame = function() {};
          }
          expect(isNaN(SurfNPerf.getFirstPaintFrame())).toBe(true);
        });
      });

      describe('when the client supports window.requestAnimationFrame and it has been called', function() {
        beforeEach(function() {
          spyOn(SurfNPerf, '_supportsRequestAnimationFrame').andReturn(true);
          spyOn(SurfNPerf, 'performanceTiming').andReturn({
            navigationStart: 1388595600000
          });
          SURF_N_PERF = {
            marks: {
              pageStart: 1388595604025,
              firstPaintFrame: 1388595601025
            },
            highResMarks: {
              firstPaintFrame: 1111.2222333344
            }
          };
          spyOn(SurfNPerf, '_setMeasure');
          spyOn(SurfNPerf, '_getMeasureDuration').andReturn(1234.12345);
        });

        describe('and the browser supports User Timing', function() {
          beforeEach(function() {
            SurfNPerf._navigationTiming = true;
            SurfNPerf._highResTime = true;
            SurfNPerf._userTiming = true;
          });

          it('returns the time to first paint calculated', function() {
            expect(SurfNPerf.getFirstPaintFrame()).toEqual(1234);
          });
        });
        describe('and the browser supports High Resolution Time but no User Timing', function() {
          beforeEach(function() {
            SurfNPerf._navigationTiming = true;
            SurfNPerf._highResTime = true;
            SurfNPerf._userTiming = false;
          });

          it('returns the time to first paint calculated', function() {
            expect(SurfNPerf.getFirstPaintFrame()).toEqual(1111);
          });
        });
        describe('and the browser supports neither High Resolution Time nor User Timing', function() {
          beforeEach(function() {
            SurfNPerf._navigationTiming = true;
            SurfNPerf._highResTime = false;
            SurfNPerf._userTiming = false;
          });

          it('returns the time to first paint calculated', function() {
            expect(SurfNPerf.getFirstPaintFrame()).toEqual(1025);
          });
        });
      });
    });
  });
});
