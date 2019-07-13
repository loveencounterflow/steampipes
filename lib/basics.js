(function() {
  'use strict';
  var CND, assign, badge, debug, declare, echo, first_of, help, info, isa, jr, last_of, misfit, remit_defaults, rpr, size_of, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/BASICS';

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
  types = require('./_types');

  ({isa, validate, declare, first_of, last_of, size_of, type_of} = types);

  misfit = Symbol('misfit');

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  /* Signals are special values that, when sent down the pipeline, may alter behavior: */
  this.signals = Object.freeze({
    last: Symbol('last'), // Used to signal last data item
    end: Symbol('end') // Request stream to terminate
  });

  
  //-----------------------------------------------------------------------------------------------------------
  /* Marks are special values that identify types, behavior of pipeline elements etc: */
  this.marks = Object.freeze({
    isa_source: Symbol('isa_source'), // Marks a source as such
    isa_through: Symbol('isa_through'), // Marks a through as such
    isa_sink: Symbol('isa_sink'), // Marks a sink as such
    isa_duct: Symbol('isa_duct'), // Marks a duct as such
    isa_pusher: Symbol('isa_pusher'), // Marks a push source as such
    send_last: Symbol('send_last') // Marks transforms expecting a certain value before EOS
  });

  
  //-----------------------------------------------------------------------------------------------------------
  remit_defaults = Object.freeze({
    first: misfit,
    last: misfit,
    between: misfit,
    after: misfit,
    before: misfit
  });

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this._get_remit_settings = function(settings, method) {
    var arity, remit_arity;
    switch (remit_arity = arguments.length) {
      case 1:
        [method, settings] = [settings, null];
        break;
      case 2:
        settings = {...remit_defaults, ...settings};
        break;
      default:
        throw new Error(`µ19358 expected 1 or 2 arguments, got ${remit_arity}`);
    }
    //.........................................................................................................
    validate.function(method);
    if ((arity = method.length) !== 2) {
      throw new Error(`µ20123 method arity ${arity} not implemented`);
    }
    if (settings != null) {
      if (settings.leapfrog != null) {
        validate.function(settings.leapfrog);
      }
      settings._surround = (settings.first !== misfit) || (settings.last !== misfit) || (settings.between !== misfit) || (settings.after !== misfit) || (settings.before !== misfit);
    }
    //.........................................................................................................
    return {settings, method};
  };

  //-----------------------------------------------------------------------------------------------------------
  this.remit = this.$ = (...P) => {
    var ME, R, data_after, data_before, data_between, data_first, data_last, do_leapfrog, has_returned, is_first, method, on_end, self, send, send_after, send_before, send_between, send_first, send_last, settings, tsend;
    ({settings, method} = this._get_remit_settings(...P));
    has_returned = false;
    send = null;
    //.........................................................................................................
    tsend = (d) => {
      if (has_returned) {
        throw new Error("µ55663 illegal to call send() after method has returned");
      }
      return send(d);
    };
    tsend.end = function() {
      return send.end();
    };
    //.........................................................................................................
    if (settings == null) {
      /* fast track without surround features */
      return (d, send_) => {
        send = send_;
        has_returned = false;
        method(d, tsend);
        has_returned = true;
        return null;
      };
    }
    //.........................................................................................................
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
    on_end = null;
    is_first = true;
    ME = this;
    //.........................................................................................................
    /* slow track with surround features */
    R = (d, send_) => {
      // debug 'µ55641', d, d is @signals.last
      send = send_;
      has_returned = false;
      //.......................................................................................................
      if (send_last && d === this.signals.last) {
        method(data_last, tsend);
      } else {
        //.......................................................................................................
        if (is_first) {
          (send_first ? method(data_first, tsend) : void 0);
        } else {
          (send_between ? method(data_between, tsend) : void 0);
        }
        if (send_before) {
          method(data_before, tsend);
        }
        is_first = false;
        //.....................................................................................................
        // When leapfrogging is being called for, only call method if the jumper returns false:
        if ((!do_leapfrog) || (!settings.leapfrog(d))) {
          method(d, tsend);
        } else {
          send(d);
        }
        if (send_after) {
          //.....................................................................................................
          method(data_after, tsend);
        }
      }
      has_returned = true;
      return null;
    };
    if (send_last) {
      //.........................................................................................................
      R[this.marks.send_last] = this.marks.send_last;
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._classify_transform = function(transform) {
    var R, name, name1, name2;
    R = (() => {
      var type;
      if (transform[this.marks.isa_duct] != null) {
        return {
          type: transform.type
        };
      }
      if (transform[this.marks.isa_pusher] != null) {
        return {
          type: 'source',
          isa_pusher: true
        };
      }
      if (transform[Symbol.iterator] != null) {
        return {
          type: 'source'
        };
      }
      switch (type = type_of(transform)) {
        case 'function':
          return {
            type: 'through'
          };
        case 'generatorfunction':
          return {
            type: 'source',
            must_call: true
          };
      }
      if (transform[this.marks.isa_sink] != null) {
        return {
          type: 'sink',
          on_end: transform.on_end
        };
      }
      throw new Error(`µ44521 expected an iterable, a function, a generator function or a sink, got a ${type}`);
    })();
    switch (R.type) {
      case 'source':
        if (transform[name = this.marks.isa_source] == null) {
          transform[name] = this.marks.isa_source;
        }
        break;
      case 'through':
        if (transform[name1 = this.marks.isa_through] == null) {
          transform[name1] = this.marks.isa_through;
        }
        break;
      case 'sink':
        if (transform[name2 = this.marks.isa_sink] == null) {
          transform[name2] = this.marks.isa_sink;
        }
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._flatten_transforms = function(transforms, R = null) {
    var i, j, len, len1, ref, t, transform;
    if (R == null) {
      R = [];
    }
    for (i = 0, len = transforms.length; i < len; i++) {
      transform = transforms[i];
      if (transform[this.marks.isa_duct] != null) {
        ref = transform.transforms;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          t = ref[j];
          /* TAINT necessary to do this recursively? */
          R.push(t);
        }
      } else {
        R.push(transform);
      }
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._new_duct = function(transforms) {
    var R, b, blurbs, i, idx, key, ref, ref1, transform;
    transforms = this._flatten_transforms(transforms);
    R = {[ref = this.marks.isa_duct]: ref, transforms};
    blurbs = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = transforms.length; i < len; i++) {
        transform = transforms[i];
        results.push(this._classify_transform(transform));
      }
      return results;
    }).call(this);
    if (transforms.length === 0) {
      return {
        ...R,
        is_empty: true
      };
    }
    //.........................................................................................................
    R.first = blurbs[0];
    if (transforms.length === 1) {
      R.is_single = true;
      R.last = R.first;
      R.type = R.first.type;
    } else {
      R.last = blurbs[transforms.length - 1];
      switch (key = `${R.first.type}/${R.last.type}`) {
        case 'source/through':
          R.type = 'source';
          break;
        case 'through/sink':
          R.type = 'sink';
          break;
        case 'through/through':
          R.type = 'through';
          break;
        case 'source/sink':
          R.type = 'circuit';
          break;
        default:
          throw new Error(`µ44521 illegal duct configuration ${rpr(key)}`);
      }
      for (idx = i = 1, ref1 = blurbs.length - 1; i < ref1; idx = i += +1) {
        if ((b = blurbs[idx]).type !== 'through') {
          throw new Error(`µ44522 illegal duct configuration at transform index ${idx}: ${rpr(b)}`);
        }
      }
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._pull = function(...transforms) {
    var _, duct, exhaust_pipeline, last, local_sink, local_source, mem_source, mem_sources, original_source, send;
    duct = this._new_duct(transforms);
    ({transforms} = duct);
    original_source = null;
    if (duct.last.type === 'source') {
      throw new Error("µ77764 source as last transform not yet supported");
    }
    if (duct.first.type === 'sink') {
      throw new Error("µ77765 sink as first transform not yet supported");
    }
    //.........................................................................................................
    if (duct.first.type === 'source') {
      original_source = transforms.shift();
      if (duct.first.must_call) {
        original_source = original_source();
      }
    }
    //.........................................................................................................
    if (duct.last.type === 'sink') {
      transforms.pop();
    }
    if (duct.type !== 'circuit') {
      //.........................................................................................................
      return duct;
    }
    //.........................................................................................................
    duct.original_source = original_source;
    duct.mem_source = mem_source = [];
    duct.mem_sources = mem_sources = [
      mem_source,
      ...((function() {
        var i,
      ref,
      results;
        results = [];
        for (_ = i = 0, ref = transforms.length; (0 <= ref ? i < ref : i > ref); _ = 0 <= ref ? ++i : --i) {
          results.push([]);
        }
        return results;
      })())
    ];
    duct.has_ended = false;
    local_sink = null;
    local_source = null;
    last = this.signals.last;
    //.........................................................................................................
    send = (d) => {
      if (d === this.signals.end) {
        return duct.has_ended = true;
      }
      return local_sink.push(d);
    };
    send.end = () => {
      return duct.has_ended = true;
    };
    //.........................................................................................................
    exhaust_pipeline = () => {
      var d, has_data, i, idx, len, transform;
      while (true) {
        has_data = false;
        for (idx = i = 0, len = transforms.length; i < len; idx = ++i) {
          transform = transforms[idx];
          if ((local_source = mem_sources[idx]).length === 0) {
            continue;
          }
          has_data = true;
          local_sink = mem_sources[idx + 1];
          d = local_source.shift();
          if (d === last) {
            if (transform[this.marks.send_last] != null) {
              transform(d, send);
            }
            send(last);
          } else {
            transform(d, send);
          }
        }
        if (!has_data) {
          break;
        }
      }
      return null;
    };
    //.........................................................................................................
    duct.send = send;
    duct.exhaust_pipeline = exhaust_pipeline;
    //.........................................................................................................
    return duct;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.pull = function(...transforms) {
    var d, duct, ref;
    duct = this._pull(...transforms);
    if (duct.type !== 'circuit') {
      return duct;
    }
    if (duct.original_source[this.marks.isa_pusher] != null) {
      return this._push(duct);
    }
    ref = duct.original_source;
    //.........................................................................................................
    for (d of ref) {
      if (duct.has_ended) {
        break;
      }
      // continue if d is @signals.discard
      duct.mem_source.push(d);
      duct.exhaust_pipeline();
    }
    //.........................................................................................................
    duct.mem_source.push(this.signals.last);
    duct.exhaust_pipeline();
    if (duct.last.on_end != null) {
      duct.last.on_end();
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._push = function(duct) {
    /* Make `duct` available from the POV of the push source: */
    duct.original_source.duct = duct;
    /* copy buffered data (from before when `pull()` was called) to `original_source`: */
    duct.mem_source.splice(duct.mem_source.length, 0, ...duct.original_source.buffer);
    /* Process any data as may have accumulated at this point: */
    duct.exhaust_pipeline();
    return null;
  };

}).call(this);