(function() {
  'use strict';
  var CND, assign, badge, debug, echo, help, info, isa, jr, rpr, type_of, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/STANDARD-TRANSFORMS';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  ({jr} = CND);

  assign = Object.assign;

  //...........................................................................................................
  ({isa, validate, type_of} = require('./types'));

  //-----------------------------------------------------------------------------------------------------------
  this.$map = function(method) {
    return this.$(function(d, send) {
      return send(method(d));
    });
  };

  this.$pass = function() {
    return this.$(function(d, send) {
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$drain = function(settings = null, on_end = null) {
    var arity;
    switch ((arity = arguments.length)) {
      case 0:
        null;
        break;
      case 2:
        null;
        break;
      case 1:
        if (isa.function(settings)) {
          [settings, on_end] = [null, settings];
        }
        break;
      default:
        throw new Error(`expected 0 to 2 arguments, got ${arity}`);
    }
    if (settings == null) {
      settings = {};
    }
    if (on_end != null) {
      settings.on_end = on_end;
    }
    return this._$drain(settings);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._$drain = function(settings) {
    var R, arity, call_with_datoms, on_end, ref, ref1, sink, use_sink;
    sink = (ref = settings != null ? settings.sink : void 0) != null ? ref : true;
    if ((on_end = settings.on_end) != null) {
      validate.function(on_end);
      switch ((arity = on_end.length)) {
        case 0:
          null;
          break;
        case 1:
          if (sink === true) {
            sink = [];
          }
          break;
        default:
          throw new Error(`expected 0 to 1 arguments, got ${arity}`);
      }
    }
    use_sink = (sink != null) && (sink !== true);
    call_with_datoms = (on_end != null) && on_end.length === 1;
    R = {[ref1 = this.marks.validated]: ref1, sink, on_end, call_with_datoms, use_sink};
    if (on_end != null) {
      R.on_end = on_end;
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$show = function(settings) {
    var ref, title;
    title = ((ref = settings != null ? settings.title : void 0) != null ? ref : '-->') + ' ';
    return this.$((d, send) => {
      info(title + jr(d));
      return send(d);
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$watch = function(settings, method) {
    /* If any `surround` feature is called for, wrap all surround values so that we can safely
    distinguish between them and ordinary stream values; this is necessary to prevent them from leaking
    into the regular stream outside the `$watch` transform: */
    var arity, key, take_second, value;
    switch (arity = arguments.length) {
      case 1:
        method = settings;
        return this.$((d, send) => {
          method(d);
          return send(d);
        });
      //.......................................................................................................
      case 2:
        if (settings == null) {
          return this.$watch(method);
        }
        take_second = Symbol('take-second');
        settings = assign({}, settings);
        for (key in settings) {
          value = settings[key];
          settings[key] = [take_second, value];
        }
        //.....................................................................................................
        return this.$(settings, (d, send) => {
          if ((CND.isa_list(d)) && (d[0] === take_second)) {
            method(d[1]);
          } else {
            method(d);
            send(d);
          }
          return null;
        });
    }
    //.........................................................................................................
    throw new Error(`µ18244 expected one or two arguments, got ${arity}`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$as_text = function(settings) {
    return (d, send) => {
      var ref, serialize;
      serialize = (ref = settings != null ? settings['serialize'] : void 0) != null ? ref : JSON.stringify;
      return this.$map((data) => {
        return serialize(data);
      });
    };
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$collect = function(settings) {
    var collector, last, ref;
    collector = (ref = settings != null ? settings.collector : void 0) != null ? ref : [];
    last = Symbol('last');
    return this.$({last}, (d, send) => {
      if (d === last) {
        return send(collector);
      }
      collector.push(d);
      return null;
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  /* Given a `settings` object, add values to the stream as `$ settings, ( d, send ) -> send d` would do,
  e.g. `$surround { first: 'first!', between: 'to appear in-between two values', }`. */
  this.$surround = function(settings) {
    return this.$(settings, (d, send) => {
      return send(d);
    });
  };

}).call(this);
