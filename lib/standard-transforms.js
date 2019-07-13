// Generated by CoffeeScript 2.4.1
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
    return (d, send) => {
      return send(method(d));
    };
  };

  this.$drain = function(on_end = null) {
    var ref;
    return {[ref = this.marks.isa_sink]: ref, on_end};
  };

  this.$pass = function() {
    return (d, send) => {
      return send(d);
    };
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

}).call(this);

//# sourceMappingURL=standard-transforms.js.map