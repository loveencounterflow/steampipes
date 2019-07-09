(function() {
  'use strict';
  var $watch, CND, assign, badge, debug, declare, echo, first_of, help, info, isa, jr, last_of, misfit, remit_defaults, rpr, size_of, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/MAIN';

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
  this.signals = {
    last: Symbol('last'), // Used to signal last data item
    end: Symbol('end') // Request stream to terminate
  };

  this.marks = {
    sink: Symbol('sink'), // Marks a sink (only used by `$drain()`)
    isa_duct: Symbol('isa_duct'), // Marks a duct
    send_last: Symbol('send_last'), // Request to get called once more after has ended
    push_source: Symbol('push_source') // Used to identify a push source; needed by `pull()`
  };

  
  //-----------------------------------------------------------------------------------------------------------
  remit_defaults = {
    first: misfit,
    last: misfit,
    between: misfit,
    after: misfit,
    before: misfit
  };

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
      R[this.marks.send_last] = true;
    }
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.$map = function(method) {
    return (d, send) => {
      return send(method(d));
    };
  };

  this.$drain = function(on_end = null) {
    var ref;
    return {[ref = this.marks.sink]: ref, on_end};
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

  // #-----------------------------------------------------------------------------------------------------------
  // @$xs = ( method ) -> ( d, send ) =>
  //   if ( d.$stamped ? false ) then return send d
  //   method d, send

  //-----------------------------------------------------------------------------------------------------------
  $watch = function(settings, method) {
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

  this.$watch = $watch.bind(this);

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
  this._classify_transform = function(transform) {
    var type;
    if (transform[this.marks.push_source] != null) {
      return {
        type: 'source',
        subtype: {
          is_push: true
        }
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
    if (transform[this.marks.sink] != null) {
      return {
        type: 'sink',
        on_end: transform.on_end
      };
    }
    throw new Error(`µ44521 expected an iterable, a function, a generator function or a sink, got a ${type}`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._classify_pipeline = function(transforms) {
    var R, ref;
    if (transforms.length === 0) {
      return {
        /* TAINT test for, complain about illegal combinations of sources, sinks */
        empty: true
      };
    }
    R = {
      [ref = this.marks.isa_duct]: ref,
      length: transforms.length,
      transforms
    };
    R.first = this._classify_transform(first_of(transforms));
    R.last = this._classify_transform(last_of(transforms));
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._pull = function(...transforms) {
    var R, _, duct, exhaust_pipeline, has_sink, has_source, last, local_sink, local_source, mem_source, mem_sources, on_end, original_source, send;
    duct = this._classify_pipeline(transforms);
    has_sink = false;
    has_source = false;
    on_end = null;
    original_source = null;
    if (duct.last.type === 'source') {
      // debug 'µ44433', duct
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
      has_source = true;
    }
    //.........................................................................................................
    if (duct.last.type === 'sink') {
      has_sink = true;
      on_end = duct.last.on_end;
      transforms.pop();
    }
    if (!(has_sink && has_source)) {
      //.........................................................................................................
      /* TAINT shouldn't return null here; return pipeline? */
      return null;
    }
    //.........................................................................................................
    mem_source = [];
    mem_sources = [
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
    local_sink = null;
    local_source = null;
    last = this.signals.last;
    //.........................................................................................................
    send = (d) => {
      if (d === this.signals.end) {
        return R.has_ended = true;
      }
      return local_sink.push(d);
    };
    send.end = () => {
      return R.has_ended = true;
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
    R = {
      mem_source,
      original_source,
      send,
      exhaust_pipeline,
      on_end,
      has_ended: false
    };
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.pull = function(...transforms) {
    var d, duct, ref;
    duct = this._pull(...transforms);
    if (duct.original_source[this.marks.push_source] != null) {
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
    if (duct.on_end != null) {
      duct.on_end();
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this._push = function(duct) {
    duct.original_source.duct = duct;
    duct.mem_source.splice(duct.mem_source.length, 0, ...duct.original_source.buffer);
    duct.exhaust_pipeline();
    return null;
  };

  //===========================================================================================================
  // SOURCES
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
      R.duct.mem_source.push(d);
      R.duct.exhaust_pipeline();
      return null;
    };
    end = () => {
      R.duct.mem_source.push(this.signals.last);
      R.duct.exhaust_pipeline();
      if (R.duct.on_end != null) {
        R.duct.on_end();
      }
      return R.duct = null;
    };
    R = {
      [ref = this.marks.push_source]: ref,
      send,
      end,
      buffer: [],
      duct: null
    };
    return R;
  };

  //===========================================================================================================

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
