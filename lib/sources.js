(function() {
  'use strict';
  var CND, assign, badge, debug, echo, help, info, isa, jr, rpr, type_of, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/SOURCES';

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
  this.new_value_source = function*(x) {
    return (yield* x);
  };

  //-----------------------------------------------------------------------------------------------------------
  this.new_push_source = function() {
    var R, end, ref, send;
    send = (d) => {
      if (R.duct == null) {
        return R.buffer.push(d);
      }
      R.buffer = null;
      if (d === this.signals.end) {
        return end();
      }
      R.duct.buckets[0].push(d);
      R.duct.exhaust_pipeline();
      return null;
    };
    end = () => {
      R.duct.buckets[0].push(this.signals.last);
      R.duct.exhaust_pipeline();
      if (R.duct.last.on_end != null) {
        R.duct.last.on_end();
      }
      return R.duct = null;
    };
    R = {
      [ref = this.marks.isa_pusher]: ref,
      send,
      end,
      buffer: [],
      duct: null
    };
    return R;
  };

}).call(this);
