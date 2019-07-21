(function() {
  'use strict';
  var $, $async, $show, $watch, CND, FS, OS, PATH, SP, alert, as_chunked_buffers, badge, debug, defer, echo, help, info, isa, jr, log, rpr, test, type_of, types, urge, validate, warn, whisper;

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

  defer = setImmediate;

  types = require('../types');

  ({isa, validate, type_of} = types);

  //-----------------------------------------------------------------------------------------------------------
  this["write to file sync"] = async function(T, done) {
    /* TAINT use proper tmpfile */
    var error, matcher, path, probe;
    path = '/tmp/steampipes-testfile.txt';
    if (FS.existsSync(path)) {
      FS.unlinkSync(path);
    }
    probe = "just a bunch of words really".split(/\s+/);
    matcher = null;
    error = null;
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, pipeline, source;
        R = [];
        source = probe;
        //.......................................................................................................
        pipeline = [];
        pipeline.push(source);
        pipeline.push($(function(d, send) {
          return send(d + '\n');
        }));
        pipeline.push($watch(function(d) {
          return info('mainline', jr(d));
        }));
        // pipeline.push SP.tee_write_to_file path
        pipeline.push(SP.tee_write_to_file_sync(path));
        pipeline.push(SP.$drain(function(sink) {
          var result;
          matcher = sink.join('');
          if (FS.existsSync(path)) {
            result = FS.readFileSync(path, {
              encoding: 'utf-8'
            });
          } else {
            result = null;
          }
          // urge 'µ77655', ( jr result ), ( jr matcher )
          T.eq(result, matcher);
          help('ok');
          return resolve(null);
        }));
        SP.pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["read_from_file"] = async function(T, done) {
    /* TAINT use proper tmpfile */
    var error, matcher, path, probe, sink;
    path = __filename;
    probe = null;
    matcher = null;
    error = null;
    sink = [];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var pipeline;
        //.......................................................................................................
        pipeline = [];
        pipeline.push(SP.read_from_file(path));
        pipeline.push($watch(function(d) {
          return info(jr(d));
        }));
        // pipeline.push SP.tee_write_to_file path
        pipeline.push(SP.$drain(function(sink) {
          // matcher = sink.join ''
          // T.eq result, matcher
          help('ok');
          return resolve(null);
        }));
        SP.pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  as_chunked_buffers = function(text, size) {
    var R, buffer, i, idx, ref, ref1;
    validate.text(text);
    validate.positive_integer(size);
    R = [];
    buffer = Buffer.from(text);
    for (idx = i = 0, ref = buffer.length, ref1 = size; ref1 !== 0 && (ref1 > 0 ? i < ref : i > ref); idx = i += ref1) {
      R.push(buffer.slice(idx, idx + size));
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["$split"] = async function(T, done) {
    /* TAINT use proper tmpfile */
    var error, i, len, matcher, path, probe, probes_and_matchers, splitter, text;
    path = __filename;
    probes_and_matchers = [[["A text that\nextends over several lines\näöüÄÖÜß", '\n'], null, null], [["A text that\nextends over several lines\näöüÄÖÜß", 'ä'], null, null], [["A text that\nextends over several lines\näöüÄÖÜß", 'ö'], null, null]];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      [text, splitter] = probe;
      matcher = text.split(splitter);
      await T.perform([text, splitter], matcher, error, function() {
        return new Promise(function(resolve, reject) {
          var pipeline, values;
          values = as_chunked_buffers(text, 3);
          pipeline = [];
          pipeline.push(values);
          pipeline.push(SP.$split(splitter));
          // pipeline.push $ ( d, send ) -> send d.toString 'utf-8'
          pipeline.push($watch(function(d) {
            return info(jr(d));
          }));
          // pipeline.push SP.tee_write_to_file path
          pipeline.push(SP.$drain(function(result) {
            return resolve(result);
          }));
          SP.pull(...pipeline);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    // test @, 'timeout': 30000
    // test @[ "read_from_file" ]
    test(this["$split"]);
  }

}).call(this);
