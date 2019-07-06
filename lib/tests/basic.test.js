(function() {
  //###########################################################################################################
  var $, $async, $show, $watch, CND, FS, OS, PATH, SP, alert, badge, debug, defer, echo, help, info, inspect, jr, log, read, rpr, test, urge, warn, whisper, xrpr,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/BASIC';

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

  //...........................................................................................................
  SP = require('../..');

  ({$, $async, $watch, $show} = SP);

  //...........................................................................................................
  read = function(path) {
    return FS.readFileSync(path, {
      encoding: 'utf-8'
    });
  };

  defer = setImmediate;

  ({inspect} = require('util'));

  xrpr = function(x) {
    return inspect(x, {
      colors: true,
      breakLength: 2e308,
      maxArrayLength: 2e308,
      depth: 2e308
    });
  };

  jr = JSON.stringify;

  // #-----------------------------------------------------------------------------------------------------------
  // @[ "test line assembler" ] = ( T, done ) ->
  //   text = """
  //   "　2. 纯；专：专～。～心～意。"
  //   !"　3. 全；满：～生。～地水。"
  //   "　4. 相同：～样。颜色不～。"
  //   "　5. 另外!的：蟋蟀～名促织。!"
  //   "　6. 表示动作短暂，或是一次，或具试探性：算～算。试～试。"!
  //   "　7. 乃；竞：～至于此。"
  //   """
  //   # text = "abc\ndefg\nhijk"
  //   chunks    = text.split '!'
  //   text      = text.replace /!/g, ''
  //   collector = []
  //   assembler = SP._new_line_assembler { extra: true, splitter: '\n', }, ( error, line ) ->
  //     throw error if error?
  //     if line?
  //       collector.push line
  //       info rpr line
  //     else
  //       # urge rpr text
  //       # help rpr collector.join '\n'
  //       # debug collector
  //       if CND.equals text, collector.join '\n'
  //         T.succeed "texts are equal"
  //       done()
  //   for chunk in chunks
  //     assembler chunk
  //   assembler null

  // #-----------------------------------------------------------------------------------------------------------
  // @[ "test throughput (1)" ] = ( T, done ) ->
  //   # input   = @new_stream PATH.resolve __dirname, '../test-data/guoxuedashi-excerpts-short.txt'
  //   input   = SP.new_stream PATH.resolve __dirname, '../../test-data/Unicode-NamesList-tiny.txt'
  //   output  = FS.createWriteStream '/tmp/output.txt'
  //   lines   = []
  //   input
  //     .pipe SP.$split()
  //     # .pipe SP.$show()
  //     .pipe SP.$succeed()
  //     .pipe SP.$as_line()
  //     .pipe $ ( line, send ) ->
  //       lines.push line
  //       send line
  //     .pipe output
  //   ### TAINT use PipeStreams method ###
  //   input.on 'end', -> outpudone()
  //   output.on 'close', ->
  //     # if CND.equals lines.join '\n'
  //     T.succeed "assuming equality"
  //     done()
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // @[ "test throughput (2)" ] = ( T, done ) ->
  //   # input   = @new_stream PATH.resolve __dirname, '../test-data/guoxuedashi-excerpts-short.txt'
  //   input   = SP.new_stream PATH.resolve __dirname, '../../test-data/Unicode-NamesList-tiny.txt'
  //   output  = FS.createWriteStream '/tmp/output.txt'
  //   lines   = []
  //   p       = input
  //   p       = p.pipe SP.$split()
  //   # p       = p.pipe SP.$show()
  //   p       = p.pipe SP.$succeed()
  //   p       = p.pipe SP.$as_line()
  //   p       = p.pipe $ ( line, send ) ->
  //       lines.push line
  //       send line
  //   p       = p.pipe output
  //   ### TAINT use PipeStreams method ###
  //   input.on 'end', -> outpudone()
  //   output.on 'close', ->
  //     # if CND.equals lines.join '\n'
  //     # debug '12001', lines
  //     T.succeed "assuming equality"
  //     done()
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // @[ "read with pipestreams" ] = ( T, done ) ->
  //   matcher       = [
  //     '01 ; charset=UTF-8',
  //     '02 @@@\tThe Unicode Standard 9.0.0',
  //     '03 @@@+\tU90M160615.lst',
  //     '04 \tUnicode 9.0.0 final names list.',
  //     '05 \tThis file is semi-automatically derived from UnicodeData.txt and',
  //     '06 \ta set of manually created annotations using a script to select',
  //     '07 \tor suppress information from the data file. The rules used',
  //     '08 \tfor this process are aimed at readability for the human reader,',
  //     '09 \tat the expense of some details; therefore, this file should not',
  //     '10 \tbe parsed for machine-readable information.',
  //     '11 @+\t\t© 2016 Unicode®, Inc.',
  //     '12 \tFor terms of use, see http://www.unicode.org/terms_of_use.html',
  //     '13 @@\t0000\tC0 Controls and Basic Latin (Basic Latin)\t007F',
  //     '14 @@+'
  //     ]
  //   # input_path    = '../../test-data/Unicode-NamesList-tiny.txt'
  //   input_path    = '/home/flow/io/basic-stream-benchmarks/test-data/Unicode-NamesList-tiny.txt'
  //   # output_path   = '/dev/null'
  //   output_path   = '/tmp/output.txt'
  //   input         = SP.new_stream input_path
  //   output        = FS.createWriteStream output_path
  //   collector     = []
  //   S             = {}
  //   S.item_count  = 0
  //   S.byte_count  = 0
  //   p             = input
  //   p             = p.pipe $ ( data, send ) -> whisper '20078-1', rpr data; send data
  //   p             = p.pipe SP.$split()
  //   p             = p.pipe $ ( data, send ) -> help '20078-1', rpr data; send data
  //   #.........................................................................................................
  //   p             = p.pipe SP.$ ( line, send ) ->
  //     S.item_count += +1
  //     S.byte_count += line.length
  //     debug '22001-0', rpr line
  //     collector.push line
  //     send line
  //   #.........................................................................................................
  //   p             = p.pipe $ ( data, send ) -> urge '20078-2', rpr data; send data
  //   p             = p.pipe SP.$as_line()
  //   p             = p.pipe output
  //   #.........................................................................................................
  //   ### TAINT use PipeStreams method ###
  //   output.on 'close', ->
  //     # debug '88862', S
  //     # debug '88862', collector
  //     if CND.equals collector, matcher
  //       T.succeed "collector equals matcher"
  //     done()
  //   #.........................................................................................................
  //   ### TAINT should be done by PipeStreams ###
  //   input.on 'end', ->
  //     outpudone()
  //   #.........................................................................................................
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // @[ "remit without end detection" ] = ( T, done ) ->
  //   pipeline = []
  //   pipeline.push $values Array.from 'abcdef'
  //   pipeline.push $ ( data, send ) ->
  //     send data
  //     send '*' + data + '*'
  //   pipeline.push SP.$show()
  //   pipeline.push $pull_drain()
  //   SP.pull pipeline...
  //   T.succeed "ok"
  //   done()

  //-----------------------------------------------------------------------------------------------------------
  this["remit"] = function(T, done) {
    var pipeline, result;
    result = [];
    pipeline = [];
    pipeline.push(Array.from('abcd'));
    pipeline.push(SP.$map(function(d) {
      return d.toUpperCase();
    }));
    pipeline.push(SP.$pass());
    pipeline.push($(function(d, send) {
      debug('µ33331', d);
      send(d);
      return send(`(${d})`);
    }));
    pipeline.push(SP.$show());
    pipeline.push($watch(function(d) {
      return result.push(d);
    }));
    pipeline.push(SP.$drain(function() {
      result = result.join('');
      T.eq(result, "A(A)B(B)C(C)D(D)");
      return done();
    }));
    return SP.pull(...pipeline);
  };

  //-----------------------------------------------------------------------------------------------------------
  this["remit with end detection 1"] = function(T, done) {
    var last, pipeline, result;
    last = Symbol('last');
    result = [];
    pipeline = [];
    pipeline.push(Array.from('abcd'));
    pipeline.push(SP.$map(function(d) {
      return d.toUpperCase();
    }));
    pipeline.push(SP.$show());
    pipeline.push($({last}, function(d, send) {
      debug('µ445522', d);
      if (d === last) {
        return send('ok');
      }
      send(d);
      return send(`(${d})`);
    }));
    pipeline.push($watch(function(d) {
      return result.push(d);
    }));
    pipeline.push(SP.$drain(function() {
      result = result.join('');
      T.eq(result, "A(A)B(B)C(C)D(D)ok");
      return done();
    }));
    return SP.pull(...pipeline);
  };

  // #-----------------------------------------------------------------------------------------------------------
  // @[ "remit with end detection 1" ] = ( T, done ) ->
  //   throw new Error "µ22920 symbols.end is not defined" if SP.symbols.end is undefined
  //   last      = Symbol 'last'
  //   result    = []
  //   pipeline  = []
  //   pipeline.push Array.from 'abcdefgh'
  //   pipeline.push SP.$map ( d ) -> d.toUpperCase()
  //   pipeline.push $ ( d, send ) -> send if d is 'E' then SP.symbols.end else d
  //   pipeline.push SP.$pass()
  //   pipeline.push SP.$show()
  //   pipeline.push $ { last, }, ( d, send ) ->
  //     return send 'ok' if d is last
  //     send d
  //     send '*' + d + '*'
  //   pipeline.push $watch ( d ) -> result.push d
  //   pipeline.push SP.$drain ->
  //     debug 'µ33398', jr result
  //     T.eq result, ["A","*A*","B","*B*","C","*C*","D","*D*","ok"]
  //     done()
  //   SP.pull pipeline...

  //-----------------------------------------------------------------------------------------------------------
  this["remit with end detection 2"] = function(T, done) {
    /* One of the proper ways to end (a.k.a. abort) a stream is to call `send.end()`. */
    var pipeline, pull_through;
    pull_through = require('../../deps/pull-through-with-end-symbol');
    pipeline = [];
    pipeline.push(SP.new_value_source(Array.from('abcdef')));
    pipeline.push(SP.$map(function(d) {
      return d;
    }));
    pipeline.push($(function(d, send) {
      if (d === 'c') {
        return send.end();
      } else {
        return send(d);
      }
    }));
    pipeline.push(SP.$pass());
    pipeline.push(pull_through((function(d) {
      return this.queue(d);
    })));
    pipeline.push($({
      last: null
    }, function(data, send) {
      if (data != null) {
        send(data);
        return send('*' + data + '*');
      } else {
        return send('ok');
      }
    }));
    pipeline.push($pull_drain(null, function() {
      T.succeed("ok");
      return done();
    }));
    return SP.pull(...pipeline);
  };

  //-----------------------------------------------------------------------------------------------------------
  this["watch with end detection 1"] = async function(T, done) {
    var error, matcher, probe;
    [probe, matcher, error] = ["abcdef", ["(", "*a*", "|", "*b*", "|", "*c*", "|", "*d*", "|", "*e*", "|", "*f*", ")"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var collector, pipeline;
        collector = [];
        pipeline = [];
        pipeline.push(SP.new_value_source(Array.from(probe)));
        pipeline.push($(function(d, send) {
          return send(`*${d}*`);
        }));
        pipeline.push(SP.$watch({
          first: '(',
          between: '|',
          last: ')'
        }, function(d) {
          debug('44874', xrpr(d));
          return collector.push(d);
        }));
        // pipeline.push SP.$collect { collector, }
        pipeline.push(SP.$drain(function() {
          help('ok');
          debug('44874', xrpr(collector));
          return resolve(collector);
        }));
        return SP.pull(...pipeline);
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["watch with end detection 2"] = async function(T, done) {
    var error, matcher, probe;
    [probe, matcher, error] = ["abcdef", ["*a*", "*b*", "*c*", "*d*", "*e*", "*f*"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var collector, pipeline;
        collector = [];
        pipeline = [];
        pipeline.push(SP.new_value_source(Array.from(probe)));
        pipeline.push($(function(d, send) {
          return send(`*${d}*`);
        }));
        pipeline.push(SP.$watch({
          first: '(',
          between: '|',
          last: ')'
        }, function(d) {
          return debug('44874', xrpr(d));
        }));
        pipeline.push(SP.$collect({collector}));
        pipeline.push(SP.$drain(function() {
          help('ok');
          debug('44874', xrpr(collector));
          return resolve(collector);
        }));
        return SP.pull(...pipeline);
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["wrap FS object for sink"] = function(T, done) {
    var output_path, output_stream, pipeline, sink;
    output_path = '/tmp/pipestreams-test-output.txt';
    output_stream = FS.createWriteStream(output_path);
    sink = SP.write_to_nodejs_stream(output_stream); //, ( error ) -> debug '37783', error
    pipeline = [];
    pipeline.push($values(Array.from('abcdef')));
    pipeline.push(SP.$show());
    pipeline.push(sink);
    pull(...pipeline);
    return output_stream.on('finish', () => {
      T.ok(CND.equals('abcdef', read(output_path)));
      return done();
    });
  };

  //-----------------------------------------------------------------------------------------------------------
  this["function as pull-stream source"] = function(T, done) {
    var pipeline, random, Ø;
    random = (n) => {
      return (end, callback) => {
        if (end != null) {
          debug('40998', rpr(callback));
          debug('40998', rpr(end));
          return callback(end);
        }
        //only read n times, then stop.
        n += -1;
        if (n < 0) {
          return callback(true);
        }
        callback(null, Math.random());
        return null;
      };
    };
    //.........................................................................................................
    pipeline = [];
    Ø = (x) => {
      return pipeline.push(x);
    };
    Ø(random(10));
    // Ø random 3
    Ø(SP.$collect());
    Ø($({
      last: null
    }, function(data, send) {
      if (data != null) {
        T.ok(data.length === 10);
        debug(data);
        return send(data);
      } else {
        T.succeed("function works as pull-stream source");
        done();
        return send(null);
      }
    }));
    Ø(SP.$show());
    Ø(SP.$drain());
    //.........................................................................................................
    SP.pull(...pipeline);
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["$surround"] = async function(T, done) {
    var error, matcher, probe;
    [probe, matcher, error] = [null, "first[(1),(2),(3),(4),(5)]last", null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, pipeline;
        R = null;
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        pipeline = [];
        pipeline.push(SP.new_value_source([1, 2, 3, 4, 5]));
        //.........................................................................................................
        pipeline.push(SP.$surround({
          first: '[',
          last: ']',
          before: '(',
          between: ',',
          after: ')'
        }));
        pipeline.push(SP.$surround({
          first: 'first',
          last: 'last'
        }));
        // pipeline.push SP.$surround { first: 'first', last: 'last', before: 'before', between: 'between', after: 'after' }
        // pipeline.push SP.$surround { first: '[', last: ']', }
        //.........................................................................................................
        pipeline.push(SP.$collect());
        pipeline.push($(function(d, send) {
          var x;
          return send(((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = d.length; i < len; i++) {
              x = d[i];
              results.push(x.toString());
            }
            return results;
          })()).join(''));
        }));
        pipeline.push(SP.$watch(function(d) {
          return R = d;
        }));
        pipeline.push(SP.$drain(drainer));
        SP.pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["$surround async"] = async function(T, done) {
    var error, matcher, probe;
    [probe, matcher, error] = [null, "[first|1|2|3|4|5|last]", null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, pipeline;
        R = null;
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        pipeline = [];
        pipeline.push(SP.new_value_source([1, 2, 3, 4, 5]));
        //.........................................................................................................
        pipeline.push(SP.$surround({
          first: 'first',
          last: 'last'
        }));
        pipeline.push($async({
          first: '[',
          last: ']',
          between: '|'
        }, (d, send, done) => {
          return defer(function() {
            // debug '22922', jr d
            send(d);
            return done();
          });
        }));
        //.........................................................................................................
        pipeline.push(SP.$collect());
        pipeline.push($(function(d, send) {
          var x;
          return send(((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = d.length; i < len; i++) {
              x = d[i];
              results.push(x.toString());
            }
            return results;
          })()).join(''));
        }));
        pipeline.push(SP.$watch(function(d) {
          return R = d;
        }));
        pipeline.push(SP.$drain(drainer));
        SP.pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["end push source (1)"] = async function(T, done) {
    /* The proper way to end a push source is to call `source.end()`. */
    var error, matcher, probe;
    [probe, matcher, error] = [["what", "a", "lot", "of", "little", "bottles"], ["what", "a", "lot", "of", "little", "bottles"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, i, len, pipeline, source, word;
        R = [];
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        source = SP.new_push_source();
        pipeline = [];
        pipeline.push(source);
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$collect({
          collector: R
        }));
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$drain(drainer));
        pull(...pipeline);
        for (i = 0, len = probe.length; i < len; i++) {
          word = probe[i];
          source.send(word);
        }
        source.end();
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["end push source (2)"] = async function(T, done) {
    /* The proper way to end a push source is to call `source.end()`. */
    var error, matcher, probe;
    [probe, matcher, error] = [["what", "a", "lot", "of", "little", "bottles", "stop"], ["what", "a", "lot", "of", "little", "bottles"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, i, len, pipeline, source, word;
        R = [];
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        source = SP.new_push_source();
        pipeline = [];
        pipeline.push(source);
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push($(function(d, send) {
          if (d === 'stop') {
            return source.end();
          } else {
            return send(d);
          }
        }));
        pipeline.push(SP.$collect({
          collector: R
        }));
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$drain(drainer));
        pull(...pipeline);
        for (i = 0, len = probe.length; i < len; i++) {
          word = probe[i];
          source.send(word);
        }
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["end push source (3)"] = async function(T, done) {
    /* The proper way to end a push source is to call `source.end()`; `send.end()` is largely equivalent. */
    var error, matcher, probe;
    [probe, matcher, error] = [["what", "a", "lot", "of", "little", "bottles", "stop"], ["what", "a", "lot", "of", "little", "bottles"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, i, len, pipeline, source, word;
        R = [];
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        source = SP.new_push_source();
        pipeline = [];
        pipeline.push(source);
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push($(function(d, send) {
          if (d === 'stop') {
            return send.end();
          } else {
            return send(d);
          }
        }));
        pipeline.push(SP.$collect({
          collector: R
        }));
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$drain(drainer));
        pull(...pipeline);
        for (i = 0, len = probe.length; i < len; i++) {
          word = probe[i];
          source.send(word);
        }
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["end push source (4)"] = async function(T, done) {
    /* A stream may be ended by using an `$end_if()` (alternatively, `$continue_if()`) transform. */
    var error, matcher, probe;
    [probe, matcher, error] = [["what", "a", "lot", "of", "little", "bottles", "stop"], ["what", "a", "lot", "of", "little", "bottles"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, i, len, pipeline, source, word;
        R = [];
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        source = SP.new_push_source();
        pipeline = [];
        pipeline.push(source);
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$end_if(function(d) {
          return d === 'stop';
        }));
        pipeline.push(SP.$collect({
          collector: R
        }));
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$drain(drainer));
        pull(...pipeline);
        for (i = 0, len = probe.length; i < len; i++) {
          word = probe[i];
          source.send(word);
        }
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["end random async source"] = async function(T, done) {
    var error, matcher, probe;
    [probe, matcher, error] = [["what", "a", "lot", "of", "little", "bottles"], ["what", "a", "lot", "of", "little", "bottles"], null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, drainer, pipeline, source;
        R = [];
        drainer = function() {
          help('ok');
          return resolve(R);
        };
        source = SP.new_random_async_value_source(probe);
        pipeline = [];
        pipeline.push(source);
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$collect({
          collector: R
        }));
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$drain(drainer));
        pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["read file chunks"] = async function(T, done) {
    var error, matcher, probe;
    [probe, matcher, error] = [__filename, null, null];
    await T.perform(probe, matcher, error, function() {
      return new Promise(function(resolve, reject) {
        var R, count, drainer, pipeline, source;
        R = [];
        drainer = function() {
          help('ok');
          return resolve(null);
        };
        source = SP.read_chunks_from_file(probe, 50);
        count = 0;
        pipeline = [];
        pipeline.push(source);
        pipeline.push($(function(d, send) {
          return send(d.toString('utf-8'));
        }));
        pipeline.push(SP.$watch(function() {
          count += +1;
          if (count > 3) {
            return source.end();
          }
        }));
        pipeline.push(SP.$collect({
          collector: R
        }));
        pipeline.push(SP.$watch(function(d) {
          return info(xrpr(d));
        }));
        pipeline.push(SP.$drain(drainer));
        pull(...pipeline);
        return null;
      });
    });
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["demo watch pipeline on abort 2"] = async function(T, done) {
    var aborting_map, error, i, len, matcher, probe, probes_and_matchers;
    // through = require 'pull-through'
    probes_and_matchers = [[[false, [1, 2, 3, null, 5]], [1, 1, 1, 2, 2, 2, 3, 3, 3, null, null, null, 5, 5, 5], null], [[true, [1, 2, 3, null, 5]], [1, 1, 1, 2, 2, 2, 3, 3, 3, null, null, null, 5, 5, 5], null], [[false, [1, 2, 3, "stop", 25, 30]], [1, 1, 1, 2, 2, 2, 3, 3, 3], null], [[true, [1, 2, 3, "stop", 25, 30]], [1, 1, 1, 2, 2, 2, 3, 3, 3], null], [[false, [1, 2, 3, null, "stop", 25, 30]], [1, 1, 1, 2, 2, 2, 3, 3, 3, null, null, null], null], [[true, [1, 2, 3, null, "stop", 25, 30]], [1, 1, 1, 2, 2, 2, 3, 3, 3, null, null, null], null], [[false, [1, 2, 3, void 0, "stop", 25, 30]], [1, 1, 1, 2, 2, 2, 3, 3, 3, void 0, void 0, void 0], null], [[true, [1, 2, 3, void 0, "stop", 25, 30]], [1, 1, 1, 2, 2, 2, 3, 3, 3, void 0, void 0, void 0], null], [[false, ["stop", 25, 30]], [], null], [[true, ["stop", 25, 30]], [], null]];
    //.........................................................................................................
    aborting_map = function(use_defer, mapper) {
      var react;
      react = function(handler, data) {
        if (data === 'stop') {
          return handler(true);
        } else {
          return handler(null, mapper(data));
        }
      };
      // a sink function: accept a source...
      return function(read) {
        // ...but return another source!
        return function(abort, handler) {
          read(abort, function(error, data) {
            if (error) {
              // if the stream has ended, pass that on.
              return handler(error);
            }
            if (use_defer) {
              defer(function() {
                return react(handler, data);
              });
            } else {
              react(handler, data);
            }
            return null;
          });
          return null;
        };
        return null;
      };
    };
//.........................................................................................................
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve) {
          var collector, pipeline, source, use_defer, values;
          //.....................................................................................................
          [use_defer, values] = probe;
          source = SP.new_value_source(values);
          collector = [];
          pipeline = [];
          pipeline.push(source);
          pipeline.push(aborting_map(use_defer, function(d) {
            info('22398-1', xrpr(d));
            return d;
          }));
          pipeline.push(SP.$(function(d, send) {
            info('22398-2', xrpr(d));
            collector.push(d);
            return send(d);
          }));
          pipeline.push(SP.$(function(d, send) {
            info('22398-3', xrpr(d));
            collector.push(d);
            return send(d);
          }));
          pipeline.push(SP.$(function(d, send) {
            info('22398-4', xrpr(d));
            collector.push(d);
            return send(d);
          }));
          // pipeline.push SP.$map ( d ) -> info '22398-2', xrpr d; collector.push d; return d
          // pipeline.push SP.$map ( d ) -> info '22398-3', xrpr d; collector.push d; return d
          // pipeline.push SP.$map ( d ) -> info '22398-4', xrpr d; collector.push d; return d
          pipeline.push(SP.$drain(function() {
            help('44998', xrpr(collector));
            return resolve(collector);
          }));
          return pull(...pipeline);
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["$mark_position"] = async function(T, done) {
    var collector, error, i, len, matcher, probe, probes_and_matchers;
    // through = require 'pull-through'
    probes_and_matchers = [
      [
        ["a"],
        [
          {
            "is_first": true,
            "is_last": true,
            "d": "a"
          }
        ],
        null
      ],
      [[],
      [],
      null],
      [
        [1,
        2,
        3],
        [
          {
            "is_first": true,
            "is_last": false,
            "d": 1
          },
          {
            "is_first": false,
            "is_last": false,
            "d": 2
          },
          {
            "is_first": false,
            "is_last": true,
            "d": 3
          }
        ],
        null
      ],
      [
        ["a",
        "b"],
        [
          {
            "is_first": true,
            "is_last": false,
            "d": "a"
          },
          {
            "is_first": false,
            "is_last": true,
            "d": "b"
          }
        ],
        null
      ]
    ];
    //.........................................................................................................
    collector = [];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve) {
          var pipeline, source;
          //.....................................................................................................
          source = SP.new_value_source(probe);
          collector = [];
          pipeline = [];
          pipeline.push(source);
          pipeline.push(SP.$mark_position());
          pipeline.push(SP.$collect({collector}));
          pipeline.push(SP.$drain(function() {
            return resolve(collector);
          }));
          return pull(...pipeline);
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["leapfrog 1"] = async function(T, done) {
    var collector, error, i, len, matcher, probe, probes_and_matchers;
    // through = require 'pull-through'
    probes_and_matchers = [
      [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          (function(d) {
            return modulo(d,
          2) !== 0;
          })
        ],
        [1,
        102,
        3,
        104,
        5,
        106,
        7,
        108,
        9,
        110],
        null
      ]
    ];
    //.........................................................................................................
    collector = [];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve) {
          var jumper, pipeline, source, values;
          [values, jumper] = probe;
          //.....................................................................................................
          source = SP.new_value_source(values);
          collector = [];
          pipeline = [];
          pipeline.push(source);
          pipeline.push(SP.$({
            leapfrog: jumper
          }, function(d, send) {
            return send(100 + d);
          }));
          pipeline.push(SP.$collect({collector}));
          pipeline.push(SP.$drain(function() {
            return resolve(collector);
          }));
          return pull(...pipeline);
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["leapfrog 2"] = async function(T, done) {
    var collector, error, i, len, matcher, probe, probes_and_matchers;
    // through = require 'pull-through'
    probes_and_matchers = [
      [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          (function(d) {
            return modulo(d,
          2) !== 0;
          })
        ],
        [1,
        102,
        3,
        104,
        5,
        106,
        7,
        108,
        9,
        110],
        null
      ]
    ];
    //.........................................................................................................
    collector = [];
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve) {
          var jumper, pipeline, source, values;
          [values, jumper] = probe;
          //.....................................................................................................
          source = SP.new_value_source(values);
          collector = [];
          pipeline = [];
          pipeline.push(source);
          pipeline.push(SP.$({
            leapfrog: jumper
          }, function(d, send) {
            return send(100 + d);
          }));
          pipeline.push(SP.$collect({collector}));
          pipeline.push(SP.$drain(function() {
            return resolve(collector);
          }));
          return pull(...pipeline);
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["$scramble"] = async function(T, done) {
    var error, i, len, matcher, probe, probes_and_matchers;
    probes_and_matchers = [[[[], 0.5, 42], [], null], [[[1], 0.5, 42], [1], null], [[[1, 2], 0.5, 42], [1, 2], null], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], 0.5, 42], [1, 4, 2, 5, 3, 6, 7, 14, 12, 9, 13, 8, 16, 10, 15, 11, 17, 18, 19, 20, 21, 22, 24, 26, 23, 25, 27, 28, 29, 30, 32, 31, 33, 34, 35, 37, 36, 38, 39, 40], null], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1, 2], [9, 2, 7, 5, 8, 4, 10, 1, 3, 6], null], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.1, 2], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null], [[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0, 2], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], null]];
//.........................................................................................................
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      //.......................................................................................................
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve, reject) {
          var cache, collector, p, pipeline, seed, values;
          [values, p, seed] = probe;
          cache = {};
          collector = [];
          pipeline = [];
          pipeline.push(SP.new_value_source(values));
          pipeline.push(SP.$scramble(p, {seed}));
          pipeline.push(SP.$collect({collector}));
          pipeline.push(SP.$drain(function() {
            return resolve(collector);
          }));
          SP.pull(...pipeline);
          //.....................................................................................................
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    // test @, 'timeout': 30000
    // test @[ "remit"                           ]
    test(this["remit with end detection 1"]);
  }

  // test @[ "remit with end detection 2"      ]
// test @[ "watch with end detection 1"      ]
// test @[ "watch with end detection 2"      ]
// test @[ "wrap FS object for sink"         ]
// test @[ "function as pull-stream source"  ]
// test @[ "$surround"                       ]
// test @[ "$surround async"                 ]
// test @[ "end push source (1)"             ]
// test @[ "end push source (2)"             ]
// test @[ "end push source (3)"             ]
// test @[ "end push source (4)"             ]
// test @[ "end random async source"         ]
// test @[ "read file chunks"                ]
// test @[ "demo watch pipeline on abort 2"  ]
// test @[ "$mark_position"                  ]
// test @[ "leapfrog 1"                      ]
// test @[ "leapfrog 2"                      ]
// test @[ "$scramble"                       ]

}).call(this);
