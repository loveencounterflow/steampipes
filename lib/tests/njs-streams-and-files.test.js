(function() {
  'use strict';
  var $, $async, $show, $watch, CND, FS, OS, PATH, SP, alert, badge, debug, echo, help, info, jr, log, rpr, test, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/NJS-STREAMS-AND-FILES';

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

  //-----------------------------------------------------------------------------------------------------------
  this["write to file"] = async function(T, done) {
    var error, matcher, path, probe;
    path = '/tmp/steampipes-testfile.txt';
    probe = "just a bunch of words really".split(/\s+/);
    matcher = null;
    error = null;
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, duct, pipeline, sink, source;
        R = [];
        source = probe;
        pipeline = [];
        sink = SP.write_to_file(path, function() {
          help('ok');
          return resolve(null);
        });
        debug('µ44521', sink);
        //.......................................................................................................
        pipeline.push(source);
        pipeline.push($(function(d, send) {
          return send(d + '\n');
        }));
        pipeline.push($watch(function(d) {
          return info('mainline', jr(d));
        }));
        pipeline.push(sink);
        duct = SP.pull(...pipeline);
        debug('µ44522', duct);
        T.eq(duct.type, 'circuit');
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
