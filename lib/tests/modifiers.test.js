(function() {
  //###########################################################################################################
  var CND, FS, OS, PATH, alert, badge, debug, defer, echo, help, info, inspect, isa, jr, log, read, rpr, test, type_of, types, urge, validate, warn, whisper, xrpr;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/MODIFIERS';

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
  // SP                        = require '../..'
  // { $
  //   $async
  //   $watch
  //   $show  }                = SP.export()
  //...........................................................................................................
  types = require('../types');

  ({isa, validate, type_of} = types);

  //...........................................................................................................
  read = function(path) {
    return FS.readFileSync(path, {
      encoding: 'utf-8'
    });
  };

  defer = setImmediate;

  ({inspect} = require('util'));

  xrpr = function(x) {
    return inspect(x, {
      colors: true,
      breakLength: 2e308,
      maxArrayLength: 2e308,
      depth: 2e308
    });
  };

  jr = JSON.stringify;

  //-----------------------------------------------------------------------------------------------------------
  this["modifiers ($before)"] = function(T, done) {
    var $, $async, $before, $drain, $show, $transform, SP;
    SP = require('../..');
    //.........................................................................................................
    ({$, $async, $drain, $before, $show} = SP.export());
    //.........................................................................................................
    $transform = () => {
      return $before(function(send) {
        debug('^12287^');
        return send("may I introduce");
      });
    };
    (() => {      //.........................................................................................................
      var matcher, pipeline, source;
      source = "Behind the Looking-Glass".split(/\s+/);
      matcher = ["may I introduce", "Behind", "the", "Looking-Glass"];
      pipeline = [];
      pipeline.push(source);
      pipeline.push($transform());
      pipeline.push($show());
      pipeline.push($drain((result) => {
        help(jr(result));
        T.eq(result, matcher);
        return done();
      }));
      SP.pull(...pipeline);
      return null;
    })();
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["modifiers ($after)"] = function(T, done) {
    var $, $after, $async, $drain, $show, $transform, SP;
    SP = require('../..');
    //.........................................................................................................
    ({$, $async, $drain, $after, $show} = SP.export());
    //.........................................................................................................
    $transform = () => {
      return $after(function(send) {
        debug('^12287^');
        return send("is an interesting book");
      });
    };
    (() => {      //.........................................................................................................
      var matcher, pipeline, source;
      source = "Behind the Looking-Glass".split(/\s+/);
      matcher = ["Behind", "the", "Looking-Glass", "is an interesting book"];
      pipeline = [];
      pipeline.push(source);
      pipeline.push($transform());
      pipeline.push($show());
      pipeline.push($drain((result) => {
        help(jr(result));
        T.eq(result, matcher);
        return done();
      }));
      SP.pull(...pipeline);
      return null;
    })();
    //.........................................................................................................
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    test(this);
  }

  // test @[ "modifiers ($before)" ]
// test @[ "modifiers ($after)" ]

}).call(this);
