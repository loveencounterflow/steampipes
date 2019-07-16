(function() {
  'use strict';
  var $, $async, $send_three, $show, $watch, CND, SP, after, badge, debug, defer, echo, help, info, jr, rpr, test, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/ASYNC';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  test = require('guy-test');

  jr = JSON.stringify;

  //...........................................................................................................
  SP = require('../..');

  ({$, $async, $watch, $show} = SP.export());

  defer = setImmediate;

  //-----------------------------------------------------------------------------------------------------------
  after = function(dts, f) {
    return setTimeout(f, dts * 1000);
  };

  //-----------------------------------------------------------------------------------------------------------
  this["async 0"] = async function(T, done) {
    var i, len, matcher, ok, probe, ref, use_async;
    ok = false;
    [probe, matcher] = ["abcdef", "1a-2a-1b-2b-1c-2c-1d-2d-1e-2e-1f-2f"];
    ref = [true, false];
    for (i = 0, len = ref.length; i < len; i++) {
      use_async = ref[i];
      await (() => {
        return new Promise((resolve) => {
          var pipeline;
          pipeline = [];
          pipeline.push(probe);
          // pipeline.push $watch ( d ) -> info 'µ1', jr d
          if (use_async) {
            pipeline.push($async(function(d, send, done) {
              defer(function() {
                return send(`1${d}`);
              });
              return after(0.1, function() {
                send(`2${d}`);
                return done();
              });
            }));
          } else {
            pipeline.push($(function(d, send) {
              send(`1${d}`);
              return send(`2${d}`);
            }));
          }
          // pipeline.push $watch ( d ) -> urge 'µ2', jr d
          pipeline.push(SP.$surround({
            between: '-'
          }));
          pipeline.push(SP.$join());
          //.........................................................................................................
          pipeline.push(SP.$watch(function(result) {
            echo(CND.gold(jr([probe, result])));
            T.eq(result, matcher);
            return ok = true;
          }));
          //.........................................................................................................
          pipeline.push(SP.$drain(function() {
            if (!ok) {
              T.fail("failed to pass test");
            }
            return resolve();
          }));
          //.........................................................................................................
          return SP.pull(...pipeline);
        });
      })();
    }
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  $send_three = function() {
    return $async(function(d, send, done) {
      var count, i, nr;
      count = 0;
      for (nr = i = 1; i <= 3; nr = ++i) {
        (function(d, nr) {
          var dt;
          dt = Math.random() / 10;
          return after(dt, function() {
            count += 1;
            send(`(${d}:${nr})`);
            if (count === 3) {
              return done();
            }
          });
        })(d, nr);
      }
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this["async 2"] = function(T, done) {
    var matcher, ok, pipeline, probe;
    ok = false;
    probe = "fdcabe";
    matcher = "(a:1)(a:2)(a:3)(b:1)(b:2)(b:3)(c:1)(c:2)(c:3)(d:1)(d:2)(d:3)(e:1)(e:2)(e:3)(f:1)(f:2)(f:3)";
    pipeline = [];
    pipeline.push(Array.from(probe));
    pipeline.push($send_three());
    // pipeline.push $show { title: '2', }
    pipeline.push(SP.$sort());
    pipeline.push(SP.$join());
    //.........................................................................................................
    pipeline.push(SP.$watch(function(result) {
      T.eq(result, matcher);
      return ok = true;
    }));
    //.........................................................................................................
    pipeline.push(SP.$watch(function(d) {
      return urge(d);
    }));
    pipeline.push(SP.$drain(function() {
      if (!ok) {
        T.fail("failed to pass test");
      }
      return done();
    }));
    //.........................................................................................................
    // T.throws /contains asynchronous transform/, -> SP.pull pipeline...
    SP.pull(...pipeline);
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    test(this, {
      timeout: 10000
    });
  }

  // test @[ "async 0" ], { timeout: 10000, }
// test @[ "async 2" ], { timeout: 10000, }

}).call(this);