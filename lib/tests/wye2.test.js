(function() {
  //###########################################################################################################
  var $, $async, $drain, $show, $watch, CND, FS, OS, PATH, SP, alert, badge, debug, echo, help, info, log, rpr, test, urge, warn, whisper;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/WYE2';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  PATH = require('path');

  FS = require('fs');

  OS = require('os');

  test = require('guy-test');

  //...........................................................................................................
  SP = require('../..');

  ({$, $async, $drain, $watch, $show} = SP.export());

  //-----------------------------------------------------------------------------------------------------------
  this["wye2 tentaitve implementation"] = async function(T, done) {
    var error, matcher, probe;
    // The proper way to end a push source is to call `source.end()`.
    [probe, matcher, error] = ['abcde', 'A(a)B(b)C(c)D(d)E(e)', null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var common, pipeline, t1, wye;
        pipeline = [];
        common = [];
        t1 = $(function(d, send) {
          info('µ98773', d);
          send(d);
          return wye.send(d.toUpperCase());
        });
        wye = function(d, send) {
          help('µ98779', d);
          return send(d);
        };
        wye.sink = common;
        wye = $(wye);
        // common    = new Proxy
        pipeline.push('abcde');
        pipeline.push(t1);
        pipeline.push($(function(d, send) {
          return send(`(${d})`);
        }));
        pipeline.push(wye);
        pipeline.push($drain(function(Σ) {
          info(Σ.join(''));
          resolve(Σ.join(''));
          return help('ok');
        }));
        SP.pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    test(this, {
      'timeout': 30000
    });
  }

}).call(this);
