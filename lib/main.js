(function() {
  'use strict';
  var CND, PD, assign, badge, debug, declare, echo, first_of, help, info, isa, jr, last_of, rpr, size_of, to_width, type_of, types, urge, validate, warn, whisper, width_of;

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
  PD = require('pipedreams11');

  types = require('../types');

  ({isa, validate, declare, first_of, last_of, size_of, type_of} = types);

  ({to_width, width_of} = require('to-width'));

  //-----------------------------------------------------------------------------------------------------------
  declare('pipestreams_is_sink_or_through', {
    tests: {
      "x is a function": function(x) {
        return this.isa.function(x);
      },
      "x's arity is 1": function(x) {
        return x.length === 1;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  declare('pipestreams_is_sink', {
    tests: {
      "x is a pipestreams_is_sink_or_through": function(x) {
        return this.isa.pipestreams_is_sink_or_through(x);
      },
      "x[ Symbol.for 'sink' ] is true": function(x) {
        var ref;
        return (ref = x[Symbol.for('sink')]) != null ? ref : false;
      }
    }
  });

  //-----------------------------------------------------------------------------------------------------------
  declare('pipestreams_is_source', {
    tests: {
      "x is a function": function(x) {
        return this.isa.function(x);
      },
      "x's arity is 2": function(x) {
        return x.length === 2;
      }
    }
  });

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.remit = this.$ = function(method) {
    return method;
  };

  this.$map = function(method) {
    return (d, send) => {
      return send(method(d));
    };
  };

  this.$drain = function(on_end = null) {
    var ref;
    return {[ref = this.symbols.sink]: ref, on_end};
  };

  //-----------------------------------------------------------------------------------------------------------
  this.symbols = {
    sink: Symbol('sink'),
    last: Symbol('last'),
    first: Symbol('first')
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
  this.$watch = function() {
    return (method) => {
      return this.$((d, send) => {
        method(d);
        return send(d);
      });
    };
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
    var _, d, description, has_data, has_sink, has_source, i, idx, len, local_sink, local_source, mem_source, mem_sources, on_end, original_source, send, transform;
    // transforms      = transforms.flat Infinity
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
    send = function(d) {
      return local_sink.push(d);
    };
//.........................................................................................................
    for (d of original_source) {
      mem_source.push(d);
      while (true) {
        //.......................................................................................................
        has_data = false;
        for (idx = i = 0, len = transforms.length; i < len; idx = ++i) {
          transform = transforms[idx];
          if ((local_source = mem_sources[idx]).length === 0) {
            continue;
          }
          has_data = true;
          local_sink = mem_sources[idx + 1];
          d = local_source.shift();
          transform(d, send);
        }
        if (!has_data) {
          break;
        }
      }
    }
    if (on_end != null) {
      //.........................................................................................................
      // warn "µ77768 stream has ended; should call transforms as appropriate"
      on_end();
    }
    return null;
  };

  //===========================================================================================================
  // SOURCES
  //-----------------------------------------------------------------------------------------------------------
  this.new_value_source = function*(x) {
    return (yield* x);
  };

  //###########################################################################################################
  if (module.parent == null) {
    (() => {
      var PDNG, PS, hits, i, len, nf, pdng_color, percentage, ps_name, ps_name_txt, ps_names;
      PS = require('pipestreams');
      PDNG = this;
      ps_names = ((function() {
        var results;
        results = [];
        for (ps_name in PS) {
          results.push(ps_name);
        }
        return results;
      })()).sort();
      hits = 0;
      for (i = 0, len = ps_names.length; i < len; i++) {
        ps_name = ps_names[i];
        if (ps_name.startsWith('_')) {
          continue;
        }
        if (PDNG[ps_name] != null) {
          hits++;
          pdng_color = CND.green;
        } else {
          pdng_color = CND.red;
        }
        ps_name_txt = to_width(ps_name, 40, {
          padder: ' ',
          align: 'left'
        });
        echo(CND.green(ps_name_txt), pdng_color(ps_name_txt));
      }
      nf = require('number-format.js');
      percentage = nf('##0.0', (hits / ps_names.length) * 100);
      return echo(`implemented ${percentage}%`);
    })();
  }

}).call(this);
