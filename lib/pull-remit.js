(function() {
  'use strict';
  var CND, assign, badge, debug, echo, help, info, isa, jr, misfit, remit_defaults, rpr, type_of, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/PULL-REMIT';

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
    var R, name, name1;
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
      if (transform[this.marks.isa_sink] != null) {
        return {
          type: 'sink',
          on_end: transform.on_end
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
      throw new Error(`µ44521 expected an iterable, a function, a generator function or a sink, got a ${type}`);
    })();
    switch (R.type) {
      case 'through':
        if (transform[name = this.marks.isa_through] == null) {
          transform[name] = this.marks.isa_through;
        }
        break;
      case 'sink':
        if (transform[name1 = this.marks.isa_sink] == null) {
          transform[name1] = this.marks.isa_sink;
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
    blurbs = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = transforms.length; i < len; i++) {
        transform = transforms[i];
        results.push(this._classify_transform(transform));
      }
      return results;
    }).call(this);
    R = {[ref = this.marks.isa_duct]: ref, transforms, blurbs};
    if (transforms.length === 0) {
      R.is_empty = true;
      return R;
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
    var _, buckets, duct, exhaust_pipeline, has_local_sink, last, local_sink, local_source, original_source, ref, send, source, tf_idxs;
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
      if (duct.first.must_call) {
        transforms[0] = transforms[0]();
      }
      source = transforms[0];
    }
    if (duct.type !== 'circuit') {
      //.........................................................................................................
      return duct;
    }
    //.........................................................................................................
    duct.buckets = buckets = (function() {
      var i, ref, results;
      results = [];
      for (_ = i = 1, ref = transforms.length - 1; (1 <= ref ? i < ref : i > ref); _ = 1 <= ref ? ++i : --i) {
        results.push([]);
      }
      return results;
    })();
    duct.has_ended = false;
    local_sink = null;
    local_source = null;
    has_local_sink = null;
    last = this.signals.last;
    tf_idxs = (function() {
      var results = [];
      for (var i = 0, ref = buckets.length - 1; 0 <= ref ? i <= ref : i >= ref; 0 <= ref ? i++ : i--){ results.push(i); }
      return results;
    }).apply(this);
    //.........................................................................................................
    send = (d) => {
      if (d === this.signals.end) {
        return duct.has_ended = true;
      }
      if (has_local_sink) {
        local_sink.push(d);
      }
      return null;
    };
    send.end = () => {
      return duct.has_ended = true;
    };
    //.........................................................................................................
    exhaust_pipeline = () => {
      var d, data_count, i, idx, len, transform;
      while (true) {
        data_count = 0;
// for transform, idx in transforms
        for (i = 0, len = tf_idxs.length; i < len; i++) {
          idx = tf_idxs[i];
          if ((local_source = buckets[idx]).length === 0) {
            continue;
          }
          transform = transforms[idx + 1];
          local_sink = buckets[idx + 1];
          has_local_sink = local_sink != null;
          d = local_source.shift();
          data_count += local_source.length;
          if (d === last) {
            if (transform[this.marks.send_last] != null) {
              transform(d, send);
            }
            send(last);
          } else {
            transform(d, send);
          }
        }
        if (data_count === 0) {
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
    var d, duct, first_bucket, ref;
    duct = this._pull(...transforms);
    if (duct.type !== 'circuit') {
      return duct;
    }
    if (duct.transforms[0][this.marks.isa_pusher] != null) {
      return this._push(duct);
    }
    first_bucket = duct.buckets[0];
    ref = duct.transforms[0];
    //.........................................................................................................
    for (d of ref) {
      if (duct.has_ended) {
        break;
      }
      // continue if d is @signals.discard
      first_bucket.push(d);
      duct.exhaust_pipeline();
    }
    //.........................................................................................................
    first_bucket.push(this.signals.last);
    duct.exhaust_pipeline();
    if (duct.last.on_end != null) {
      // on_end = duct.last.on_end ? null
      // delete duct[ k ] for k of duct
      // on_end() if on_end?
      duct.last.on_end();
    }
    return duct;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._push = function(duct) {
    /* copy buffered data (from before when `pull()` was called) to `source`: */
    /* Make `duct` available from the POV of the push source: */
    var first_bucket, source;
    source = duct.transforms[0];
    source.duct = duct;
    first_bucket = duct.buckets[0];
    first_bucket.splice(first_bucket.length, 0, ...source.buffer);
    /* Process any data as may have accumulated at this point: */
    duct.exhaust_pipeline();
    return null;
  };

}).call(this);
