// Generated by CoffeeScript 2.5.1
(function() {
  //###########################################################################################################
  var $, $async, CND, FS, OS, PATH, SP, alert, badge, debug, echo, help, info, log, rpr, test, urge, warn, whisper;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/TEE';

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

  ({$, $async} = SP);

  //...........................................................................................................

  //-----------------------------------------------------------------------------------------------------------
  this["sample (p = 0)"] = function(T, done) {
    var matcher, pipeline, probe, source;
    probe = Array.from('𠳬矗㒹兢林森𣡕𣡽𨲍騳𩥋驫𦣦臦𦣩𫇆');
    matcher = '';
    source = SP.new_value_source(Array.from(probe));
    //.........................................................................................................
    pipeline = [];
    pipeline.push(source);
    pipeline.push(SP.$sample(0));
    pipeline.push(SP.$collect());
    pipeline.push(SP.$watch(function(chrs) {
      chrs = chrs.join('');
      help(chrs, chrs.length);
      return T.ok(CND.equals(chrs, matcher));
    }));
    pipeline.push(SP.$drain(done));
    //.........................................................................................................
    SP.pull(...pipeline);
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["sample (p = 1)"] = function(T, done) {
    var matcher, pipeline, probe, source;
    probe = '𠳬矗㒹兢林森𣡕𣡽𨲍騳𩥋驫𦣦臦𦣩𫇆';
    matcher = probe;
    source = SP.new_value_source(Array.from(probe));
    //.........................................................................................................
    pipeline = [];
    pipeline.push(source);
    pipeline.push(SP.$sample(1));
    pipeline.push(SP.$collect());
    pipeline.push(SP.$watch(function(chrs) {
      chrs = chrs.join('');
      help(chrs, chrs.length);
      return T.ok(CND.equals(chrs, matcher));
    }));
    pipeline.push(SP.$drain(done));
    //.........................................................................................................
    SP.pull(...pipeline);
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["sample (1)"] = function(T, done) {
    var matcher, pipeline, probe, source;
    probe = '𠳬矗㒹兢林森𣡕𣡽𨲍騳𩥋驫𦣦臦𦣩𫇆';
    matcher = '𠳬㒹森𣡽𨲍騳𩥋𦣦臦𦣩𫇆';
    source = SP.new_value_source(Array.from(probe));
    //.........................................................................................................
    pipeline = [];
    pipeline.push(source);
    pipeline.push(SP.$sample(8 / 16, {
      seed: 6615
    }));
    pipeline.push(SP.$collect());
    pipeline.push(SP.$watch(function(data) {
      return help(data.join(''), data.length);
    }));
    pipeline.push(SP.$drain(done));
    //.........................................................................................................
    SP.pull(...pipeline);
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    test(this);
  }

}).call(this);

//# sourceMappingURL=sample.test.js.map
