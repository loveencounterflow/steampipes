(function() {
  'use strict';
  var CND, assign, badge, debug, declare, echo, first_of, help, info, isa, jr, last_of, remit_defaults, rpr, size_of, type_of, types, urge, validate, warn, whisper;

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

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.symbols = {
    sink: Symbol('sink'), // Marks a sink (only used by `$drain()`)
    last: Symbol('last'), // May be used to signal last  data item
    first: Symbol('first'), // May be used to signal first data item
    end: Symbol('end'), // Request stream to terminate
    misfit: Symbol('misfit'), // Bottom value
    send_last: Symbol('send_last') // Request to get called once more after has ended
  };

  
  //-----------------------------------------------------------------------------------------------------------
  remit_defaults = {
    first: this.symbols.misfit,
    last: this.symbols.misfit,
    between: this.symbols.misfit,
    after: this.symbols.misfit,
    before: this.symbols.misfit
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
      settings._surround = (settings.first !== this.symbols.misfit) || (settings.last !== this.symbols.misfit) || (settings.between !== this.symbols.misfit) || (settings.after !== this.symbols.misfit) || (settings.before !== this.symbols.misfit);
    }
    //.........................................................................................................
    return {settings, method};
  };

  //-----------------------------------------------------------------------------------------------------------
  this.remit = this.$ = (...P) => {
    var ME, R, data_after, data_before, data_between, data_first, data_last, do_leapfrog, has_returned, is_first, method, on_end, self, send, send_after, send_before, send_between, send_first, send_last, settings, tsend;
    ({settings, method} = this._get_remit_settings(...P));
    if (settings === null) {
      return method;
    }
    self = null;
    do_leapfrog = settings.leapfrog;
    data_first = settings.first;
    data_before = settings.before;
    data_between = settings.between;
    data_after = settings.after;
    data_last = settings.last;
    send_first = data_first !== this.symbols.misfit;
    send_before = data_before !== this.symbols.misfit;
    send_between = data_between !== this.symbols.misfit;
    send_after = data_after !== this.symbols.misfit;
    send_last = data_last !== this.symbols.misfit;
    on_end = null;
    is_first = true;
    ME = this;
    has_returned = false;
    send = null;
    //.........................................................................................................
    // on_end = ->
    //   if send_last
    //     self = @
    //     method data_last, send
    //     self = null
    //   # defer -> @queue ME.symbols.end
    //   @queue ME.symbols.end
    //   return null
    //.........................................................................................................
    tsend = (d) => {
      if (has_returned) {
        throw new Error("µ55663 illegal to call send() after method has returned");
      }
      return send(d);
    };
    //.........................................................................................................
    R = (d, send_) => {
      // debug 'µ55641', d, d is @symbols.last
      send = send_;
      has_returned = false;
      //.......................................................................................................
      if (send_last && d === this.symbols.last) {
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
      R[this.symbols.send_last] = true;
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
    return {[ref = this.symbols.sink]: ref, on_end};
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
  this.$watch = (method) => {
    return this.$((d, send) => {
      method(d);
      return send(d);
    });
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
  this._classify_transform = function(transform) {
    var type;
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
    if (transform[this.symbols.sink] != null) {
      return {
        type: 'sink',
        on_end: transform.on_end
      };
    }
    throw new Error(`µ44521 expected an iterable, a function, a generator function or a sink, got a ${type}`);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._classify_pipeline = function(transforms) {
    var R;
    if (transforms.length === 0) {
      return {
        /* TAINT test for, complain about illegal combinations of sources, sinks */
        empty: true
      };
    }
    R = {
      length: transforms.length
    };
    R.first = this._classify_transform(first_of(transforms));
    R.last = this._classify_transform(last_of(transforms));
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  this.pull = function(...transforms) {
    var _, d, description, exhaust_pipeline, has_sink, has_source, i, iterable, last, len, local_sink, local_source, mem_source, mem_sources, on_end, original_source, ref, send;
    description = this._classify_pipeline(transforms);
    has_sink = false;
    has_source = false;
    on_end = null;
    original_source = null;
    if (description.last.type === 'source') {
      throw new Error("µ77764 source as last transform not yet supported");
    }
    if (description.first.type === 'sink') {
      throw new Error("µ77765 sink as first transform not yet supported");
    }
    //.........................................................................................................
    if (description.first.type === 'source') {
      original_source = transforms.shift();
      if (description.first.must_call) {
        original_source = original_source();
      }
      has_source = true;
    }
    //.........................................................................................................
    if (description.last.type === 'sink') {
      has_sink = true;
      on_end = description.last.on_end;
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
    last = this.symbols.last;
    send = function(d) {
      return local_sink.push(d);
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
            if (transform[this.symbols.send_last] != null) {
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
    ref = [original_source, [last]];
    //.........................................................................................................
    for (i = 0, len = ref.length; i < len; i++) {
      iterable = ref[i];
/* :main_iterator */
      for (d of iterable) {
        /* :source_iterator */
        mem_source.push(d);
        exhaust_pipeline();
      }
    }
    if (on_end != null) {
      //.........................................................................................................
      on_end();
    }
    return null;
  };

  // #-----------------------------------------------------------------------------------------------------------
  // @pull = ( transforms... ) ->
  //   # transforms      = transforms.flat Infinity
  //   description     = @_classify_pipeline transforms
  //   has_sink        = false
  //   has_source      = false
  //   on_end          = null
  //   original_source = null
  //   throw new Error "µ77764 source as last transform not yet supported" if description.last.type  is 'source'
  //   throw new Error "µ77765 sink as first transform not yet supported"  if description.first.type is 'sink'
  //   #.........................................................................................................
  //   if description.first.type is 'source'
  //     original_source = transforms.shift()
  //     original_source = original_source() if description.first.must_call
  //     has_source      = true
  //   #.........................................................................................................
  //   if description.last.type is 'sink'
  //     has_sink  = true
  //     on_end    = description.last.on_end
  //     transforms.pop()
  //   #.........................................................................................................
  //   ### TAINT shouldn't return null here; return pipeline? ###
  //   return null unless has_sink and has_source
  //   #.........................................................................................................
  //   mem_source      = []
  //   mem_sources     = [ mem_source, ( [] for _ in [ 0 ... transforms.length ] )..., ]
  //   local_sink      = null
  //   local_source    = null
  //   has_ended       = false
  //   terminate_now   = false
  //   #.........................................................................................................
  //   send = ( d ) =>
  //     return has_ended = true if d is @symbols.end
  //     local_sink.push d
  //   send.end = => has_ended = true
  //   #.........................................................................................................
  //   for iterable in [ original_source, [ @symbols.last, ], ]
  //     ### :main_iterator ###
  //     for d from iterable
  //       ### :source_iterator ###
  //       loop
  //         ### :insert_last ###
  //         if has_ended
  //           terminate_now = true
  //           d             = @symbols.last
  //         debug 'µ77785-1', d
  //         mem_source.push d
  //         loop
  //           ### :transforms_loop ###
  //           has_data = false
  //           for transform, idx in transforms
  //             send_last     = transform[ @symbols.send_last ]?
  //             local_sink    = mem_sources[ idx + 1 ]
  //             local_source  = mem_sources[ idx ]
  //             if local_source.length is 0
  //               if has_ended and send_last
  //                 transform @symbols.last, send
  //                 # has_data = true if local_sink.length > 0
  //               continue
  //             has_data      = true
  //             d             = local_source.shift()
  //             transform d, send unless ( d is @symbols.last ) and ( not send_last )
  //           ### :transforms_loop ###
  //           debug 'µ77785-2', d, not has_data
  //           break unless has_data
  //         ### :insert_last ###
  //         debug 'µ77785-3', d, terminate_now or not has_ended
  //         break if terminate_now or not has_ended
  //       ### :source_iterator ###
  //       debug 'µ77785-4', d, terminate_now
  //       break if terminate_now
  //     #.......................................................................................................
  //     ### :main_iterator ###
  //     break if terminate_now
  //   #.........................................................................................................
  //   on_end() if on_end?
  //   return null

  //===========================================================================================================
  // SOURCES
  //-----------------------------------------------------------------------------------------------------------
  this.new_value_source = function*(x) {
    return (yield* x);
  };

}).call(this);
