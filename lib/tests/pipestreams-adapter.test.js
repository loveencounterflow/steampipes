(function() {
  'use strict';
  var $, $async, $show, $watch, CND, FS, OS, PATH, PD, SP, alert, badge, debug, echo, help, info, jr, log, rpr, test, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/PIPESTREAM-ADAPTER';

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

  ({jr} = CND);

  //...........................................................................................................
  SP = require('../..');

  ({$, $async, $watch, $show} = SP.export());

  PD = require('pipedreams');

  //-----------------------------------------------------------------------------------------------------------
  this["adapt 1"] = async function(T, done) {
    var error, matcher, probe;
    probe = "just a bunch of words really".split(/\s+/);
    matcher = [...probe];
    error = null;
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, pipeline, source;
        R = [];
        source = probe;
        pipeline = [];
        //.......................................................................................................
        pipeline.push(source);
        pipeline.push(SP.$watch(function(d) {
          return info(jr(d));
        }));
        pipeline.push(SP.adapt_ps_transform(PD.$collect({
          collector: R
        })));
        pipeline.push(SP.$drain(function() {
          help('ok');
          return resolve(R);
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