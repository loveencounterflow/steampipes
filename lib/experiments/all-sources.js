(function() {
  //###########################################################################################################
  var $, $async, $drain, $show, $watch, CND, FS, OS, PATH, SP, alert, badge, debug, defaults, echo, help, info, isa, jr, log, lpad, rpad, rpr, test, type_of, types_of, urge, validate, warn, whisper;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/ALL-SOURCES';

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

  ({jr} = CND);

  //...........................................................................................................
  ({isa, validate, defaults, types_of, type_of} = require('../types'));

  //...........................................................................................................
  SP = require('../..');

  ({$, $async, $drain, $watch, $show} = SP.export());

  //...........................................................................................................
  rpad = function(x, ...P) {
    return x.padEnd(...P);
  };

  lpad = function(x, ...P) {
    return x.padStart(...P);
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this._get_custom_iterable_1 = function() {
    /* ths to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols */
    var myIterable;
    myIterable = {
      [Symbol.iterator]: function*() {
        yield "𫠠";
        yield "𫠡";
        return (yield "𫠢");
      }
    };
    return ['mdn_custom_iterable', myIterable, ["𫠠", "𫠡", "𫠢"], null];
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_custom_iterable_2 = function() {
    var myIterable_2;
    myIterable_2 = {
      [Symbol.iterator]: function() {
        return ["𫠠", "𫠡", "𫠢"];
      }
    };
    return ['object_with_list_as_iterator', myIterable_2, ["𫠠", "𫠡", "𫠢"], null];
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_standard_iterables = function() {
    return [
      ['text',
      "𫠠𫠡𫠢",
      ["𫠠",
      "𫠡",
      "𫠢"],
      null],
      ['list',
      ["𫠠",
      "𫠡",
      "𫠢"],
      ["𫠠",
      "𫠡",
      "𫠢"],
      null],
      ['set',
      new Set("abcde𫠠𫠡𫠢𫠣"),
      ["a",
      "b",
      "c",
      "d",
      "e",
      "𫠠",
      "𫠡",
      "𫠢",
      "𫠣"],
      null],
      ['map',
      new Map([["abcde",
      "𫠠𫠡𫠢𫠣"]]),
      [["abcde",
      "𫠠𫠡𫠢𫠣"]],
      null],
      [
        'generator',
        (function*() {
          yield '𫠠';
          yield '𫠡';
          return (yield '𫠢');
        })(),
        ["𫠠",
        "𫠡",
        "𫠢"],
        null
      ]
    ];
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_generatorfunction = function() {
    return [
      'generatorfunction',
      (function*() {
        yield '𫠠';
        yield '𫠡';
        return (yield '𫠢');
      }),
      ["𫠠",
      "𫠡",
      "𫠢"],
      null
    ];
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_asyncgenerator = function() {
    return [
      'asyncgenerator',
      (async function*() {
        await 42;
        yield '𫠠';
        yield '𫠡';
        return (yield '𫠢');
      })(),
      ["𫠠",
      "𫠡",
      "𫠢"],
      null
    ];
  };

  //-----------------------------------------------------------------------------------------------------------
  this._get_asyncgeneratorfunction = function() {
    return [
      'asyncgeneratorfunction',
      (async function*() {
        await 42;
        yield '𫠠';
        yield '𫠡';
        return (yield '𫠢');
      }),
      ["𫠠",
      "𫠡",
      "𫠢"],
      null
    ];
  };

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this["texts, lists, generators etc"] = async function(T, done) {
    var error, i, len, matcher, name, probe, probes_and_matchers;
    probes_and_matchers = this._get_standard_iterables();
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [name, probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve, reject) {
          var d, ref, result;
          result = [];
          T.eq(type_of(probe[Symbol.iterator]), 'function');
          ref = probe[Symbol.iterator]();
          /* NOTE that `for d from x` works on code*points* whereas `for d in x` works on code*units* */
          /* NOTE we use `for d from probe[ Symbol.iterator ]()` instead of for d from probe` b/c it is more
          general */
          for (d of ref) {
            // urge jr d
            result.push(d);
          }
          resolve(result);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["generatorfunction"] = async function(T, done) {
    var error, i, len, matcher, name, probe, probes_and_matchers;
    probes_and_matchers = [this._get_generatorfunction()];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [name, probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve, reject) {
          var d, ref, result;
          result = [];
          T.eq(type_of(probe), 'generatorfunction');
          // debug '^55573-1^', type_of probe[ Symbol.iterator ]
          probe = probe();
          T.eq(type_of(probe), 'generator');
          ref = probe[Symbol.iterator]();
          // debug '^55573-2^', type_of probe[ Symbol.iterator ]
          for (d of ref) {
            // urge jr d
            result.push(d);
          }
          resolve(result);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["asyncgenerator"] = async function(T, done) {
    var error, i, len, matcher, name, probe, probes_and_matchers;
    probes_and_matchers = [this._get_asyncgenerator()];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [name, probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(async function(resolve, reject) {
          var d, ref, result;
          result = [];
          T.eq(type_of(probe), 'asyncgenerator');
          T.eq(type_of(probe[Symbol.asyncIterator]), 'function');
          T.eq(type_of(probe[Symbol.asyncIterator]()), 'asyncgenerator');
          ref = probe[Symbol.asyncIterator]();
          for await (d of ref) {
            result.push(d);
          }
          resolve(result);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["asyncgeneratorfunction"] = async function(T, done) {
    var error, i, len, matcher, name, probe, probes_and_matchers;
    probes_and_matchers = [this._get_asyncgeneratorfunction()];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [name, probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(async function(resolve, reject) {
          var d, ref, result;
          result = [];
          T.eq(type_of(probe), 'asyncgeneratorfunction');
          probe = probe();
          T.eq(type_of(probe), 'asyncgenerator');
          T.eq(type_of(probe[Symbol.asyncIterator]), 'function');
          ref = probe[Symbol.asyncIterator]();
          for await (d of ref) {
            // urge jr d
            result.push(d);
          }
          resolve(result);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["custom iterable"] = async function(T, done) {
    /* NOTE: treatment of custom iterables is already dealt with in `@[ "texts, lists, generators etc" ]`
    since there, too, `probe[ Symbol.iterator ]()` is used in the `for d from x` loop */
    /* see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators */
    var error, i, len, matcher, name, probe, probes_and_matchers;
    probes_and_matchers = [this._get_custom_iterable_1(), this._get_custom_iterable_2()];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [name, probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve, reject) {
          var d, ref, ref1, result;
          result = [];
          T.eq(type_of(probe), 'object');
          debug('^5777764^', type_of(probe[Symbol.iterator]));
          T.ok((ref = type_of(probe[Symbol.iterator])) === 'generatorfunction' || ref === 'function');
          ref1 = probe[Symbol.iterator]();
          for (d of ref1) {
            // urge jr d
            result.push(d);
          }
          resolve(result);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["tabulate distinctive features"] = function(T, done) {
    (() => {
      /* TAINT should not call iterator before ready; here done for illustration */
      var async_iterator, async_iterator_type, async_iterator_type_txt, d, i, iterator, iterator_return_type, iterator_return_type_txt, iterator_type, iterator_type_txt, len, mode, mode_txt, name, name_txt, probe, probe_txt, probe_type, probe_type_txt, probes_and_matchers, result, result_txt, results;
      probes_and_matchers = [...this._get_standard_iterables(), this._get_custom_iterable_2(), this._get_generatorfunction(), this._get_asyncgenerator(), this._get_asyncgeneratorfunction(), this._get_custom_iterable_1()];
      results = [];
      for (i = 0, len = probes_and_matchers.length; i < len; i++) {
        [name, probe] = probes_and_matchers[i];
        mode = 'sync';
        probe_type = type_of(probe);
        //.....................................................................................................
        if (probe_type === 'generatorfunction' || probe_type === 'asyncgeneratorfunction') {
          probe = probe();
          probe_type = type_of(probe);
        }
        //.....................................................................................................
        iterator = probe[Symbol.iterator];
        iterator_type = type_of(iterator);
        iterator_return_type = './.';
        //.....................................................................................................
        if (iterator_type === 'function') {
          iterator_return_type = type_of(iterator.apply(probe));
        }
        //.....................................................................................................
        async_iterator = void 0;
        async_iterator_type = 'undefined';
        if (iterator == null) {
          async_iterator = probe[Symbol.asyncIterator];
          async_iterator_type = type_of(async_iterator);
          mode = 'async';
        }
        if (iterator_type === 'undefined') {
          //.....................................................................................................
          iterator_type = './.';
        }
        if (async_iterator_type === 'undefined') {
          async_iterator_type = './.';
        }
        // #.....................................................................................................
        // generator                 = null
        // if iterator_type is 'generatorfunction'
        //   debug iterator.apply probe
        // #.....................................................................................................
        // else if async_iterator_type is 'asyncgeneratorfunction'
        //   debug async_iterator.apply probe
        //.....................................................................................................
        debug(mode);
        switch (mode) {
          case 'sync':
            result = (function() {
              var ref, results1;
              ref = iterator.apply(probe);
              results1 = [];
              for (d of ref) {
                results1.push(d);
              }
              return results1;
            })();
            break;
          case 'async':
            result = null; // ( d for await  d from async_iterator.apply probe )
        }
        //.....................................................................................................
        name_txt = CND.blue(rpad(name, 30));
        probe_type_txt = CND.gold(rpad(probe_type, 23));
        mode_txt = CND.steel(lpad(mode, 5));
        iterator_type_txt = CND.gold(rpad(iterator_type, 20));
        iterator_return_type_txt = CND.lime(rpad(iterator_return_type, 20));
        async_iterator_type_txt = CND.gold(rpad(async_iterator_type, 20));
        result_txt = CND.green(rpad((jr(result)).slice(0, 16), 15));
        probe_txt = CND.grey(((rpr(probe)).replace(/\s+/g, ' ')).slice(0, 41));
        //.....................................................................................................
        results.push(echo(name_txt, probe_type_txt, mode_txt, iterator_type_txt, CND.white('->'), iterator_return_type_txt, async_iterator_type_txt, result_txt));
      }
      return results;
    })();
    // probe_txt
    return done();
  };

  //-----------------------------------------------------------------------------------------------------------
  this["_get iterator from source"] = function(T, done) {
    SP._iterator_from_source = function(source) {
      var iterator, iterator_type, mode, type;
      mode = 'sync';
      iterator = source[Symbol.iterator];
      iterator_type = type_of(iterator);
      if (type === 'generatorfunction' || type === 'asyncgeneratorfunction') {
        source = source();
        iterator = source[Symbol.iterator];
        iterator_type = type_of(iterator);
        if (type === 'asyncgeneratorfunction') {
          mode = 'async';
        }
      }
      if (iterator_type === 'function') {
        iterator = iterator();
        return {mode, iterator};
      }
      iterator = source[Symbol.asyncIterator];
      iterator_type = type_of(iterator);
      // if
      //   when 'undefined'
      //     debug '^323336^>>>>>>>>>>>>>>>>', source

      //   else
      //     throw new Error "^steampipes/_iterator_from_source@33398^ unknown type #{rpr type} for source[ Symbol.iterator ]"
      type = type_of(source);
      throw new Error(`^steampipes/_iterator_from_source@33399^ unable to produce iterator for source type ${rpr(type)}`);
    };
    return (async() => {
      var error, i, len, matcher, name, probe, probes_and_matchers;
      probes_and_matchers = [...this._get_standard_iterables(), this._get_custom_iterable_2(), this._get_custom_iterable_1(), this._get_generatorfunction(), this._get_asyncgeneratorfunction()];
      for (i = 0, len = probes_and_matchers.length; i < len; i++) {
        [name, probe, matcher, error] = probes_and_matchers[i];
        await T.perform(probe, matcher, error, function() {
          return new Promise(function(resolve, reject) {
            var d, iterator, mode, result;
            result = [];
            debug(probe);
            ({mode, iterator} = SP._iterator_from_source(probe));
            switch (mode) {
              case 'sync':
                for (d of iterator) {
                  result.push(d);
                }
                break;
              case 'async':
                throw new Error("µ498282 async mode not implemented");
              default:
                throw new Error(`µ498283 unknown iterator mode ${rpr(mode)}`);
            }
            return resolve(result);
          });
        });
      }
      return done();
    })();
  };

  //###########################################################################################################
  if (module.parent == null) {
    test(this);
  }

  // test @[ "tabulate distinctive features" ].bind @
// test @[ "wye construction (async)" ]
// test @[ "wye construction (method)" ]
// test @[ "generatorfunction" ]
// test @[ "asyncgeneratorfunction" ]

}).call(this);
