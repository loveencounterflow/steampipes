(function() {
  'use strict';
  var CND, assign, badge, debug, echo, help, info, isa, jr, misfit, remit_defaults, rpr, type_of, urge, validate, warn, whisper,
    splice = [].splice;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/MODIFY';

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

  misfit = Symbol('misfit');

  //-----------------------------------------------------------------------------------------------------------
  remit_defaults = Object.freeze({
    first: misfit,
    last: misfit,
    between: misfit,
    after: misfit,
    before: misfit
  });

  //-----------------------------------------------------------------------------------------------------------
  this._get_remit_settings = function(settings) {
    if (settings.leapfrog != null) {
      validate.function(settings.leapfrog);
    }
    settings._surround = (settings.first !== misfit) || (settings.last !== misfit) || (settings.between !== misfit) || (settings.after !== misfit) || (settings.before !== misfit);
    //.........................................................................................................
    return settings;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.modify = function(...modifications) {
    var R, data_after, data_before, data_between, data_first, data_last, do_leapfrog, is_first, ref, self, send_after, send_before, send_between, send_first, send_last, settings, transform;
    ref = modifications, [...modifications] = ref, [transform] = splice.call(modifications, -1);
    if (modifications.length === 0) {
      /* Can always call `modify $ ( d, send ) -> ...` with no effect: */
      return transform;
    }
    //.........................................................................................................
    settings = this._get_remit_settings(Object.assign({}, remit_defaults, ...modifications));
    self = null;
    do_leapfrog = settings.leapfrog;
    data_first = settings.first;
    data_before = settings.before;
    data_between = settings.between;
    data_after = settings.after;
    data_last = settings.last;
    send_first = data_first !== misfit;
    send_before = data_before !== misfit;
    send_between = data_between !== misfit;
    send_after = data_after !== misfit;
    send_last = data_last !== misfit;
    is_first = true;
    //.........................................................................................................
    /* slow track with surround features */
    R = (d, send) => {
      var has_returned;
      has_returned = false;
      //.......................................................................................................
      if (send_last && d === this.signals.last) {
        transform(data_last, send);
      } else {
        //.......................................................................................................
        if (is_first) {
          (send_first ? transform(data_first, send) : void 0);
        } else {
          (send_between ? transform(data_between, send) : void 0);
        }
        if (send_before) {
          transform(data_before, send);
        }
        is_first = false;
        //.....................................................................................................
        // When leapfrogging is being called for, only call transform if the jumper returns false:
        if ((!do_leapfrog) || (!settings.leapfrog(d))) {
          transform(d, send);
        } else {
          send(d);
        }
        if (send_after) {
          //.....................................................................................................
          transform(data_after, send);
        }
      }
      has_returned = true;
      return null;
    };
    //.........................................................................................................
    R.sink = transform.sink;
    R.send = transform.send;
    delete transform.sink;
    delete transform.send;
    if (send_last) {
      R[this.marks.send_last] = this.marks.send_last;
    }
    return R;
  };

}).call(this);