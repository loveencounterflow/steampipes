(function() {
  'use strict';
  var CND, FS, badge, debug, defer, isa, type_of, types, validate;

  //###########################################################################################################
  CND = require('cnd');

  badge = 'STEAMPIPES/NJS-STREAMS-AND-FILES';

  debug = CND.get_logger('debug', badge);

  FS = require('fs');

  // TO_PULL_STREAM            = require 'stream-to-pull-stream'
  // TO_NODE_STREAM            = require '../deps/pull-stream-to-stream-patched'
  // TO_NODE_STREAM            = require 'pull-stream-to-stream'
  defer = setImmediate;

  types = require('./types');

  ({isa, validate, type_of} = types);

  //===========================================================================================================
  // READ FROM, WRITE TO FILES, NODEJS STREAMS
  // #-----------------------------------------------------------------------------------------------------------
  // @read_from_file = ( path, options ) ->
  //   ### TAINT consider using https://pull-stream.github.io/#pull-file-reader instead ###
  //   switch ( arity = arguments.length )
  //     when 1 then null
  //     when 2
  //       if CND.isa_function options
  //         [ path, options, on_end, ] = [ path, null, options, ]
  //     else throw new Error "µ9983 expected 1 or 2 arguments, got #{arity}"
  //   #.........................................................................................................
  //   return @read_from_nodejs_stream ( FS.createReadStream path, options )

  // #-----------------------------------------------------------------------------------------------------------
  // @read_chunks_from_file = ( path, byte_count ) ->
  //   unless ( CND.isa_number byte_count ) and ( byte_count > 0 ) and ( byte_count is parseInt byte_count )
  //     throw new Error "expected positive integer number, got #{rpr byte_count}"
  //   pfy           = ( require 'util' ).promisify
  //   source        = @new_push_source()
  //   #.........................................................................................................
  //   defer =>
  //     fd    = await ( pfy FS.open ) path, 'r'
  //     read  = pfy FS.read
  //     loop
  //       buffer = Buffer.alloc byte_count
  //       await read fd, buffer, 0, byte_count, null
  //       source.send buffer
  //     return null
  //   #.........................................................................................................
  //   return source

  //-----------------------------------------------------------------------------------------------------------
  this.write_to_file = function(path, options, on_end) {
    /* TAINT consider to abandon all sinks except `$drain()` and use throughs with writers instead */
    /* TAINT consider using https://pull-stream.github.io/#pull-write-file instead */
    /* TAINT code duplication */
    var arity;
    switch ((arity = arguments.length)) {
      case 1:
        null;
        break;
      case 2:
        if (CND.isa_function(options)) {
          [path, options, on_end] = [path, null, options];
        }
        break;
      case 3:
        null;
        break;
      default:
        throw new Error(`µ9983 expected 1 to 3 arguments, got ${arity}`);
    }
    //.........................................................................................................
    // R           = @write_to_nodejs_stream ( FS.createWriteStream path, options ), on_end
    // description = { type: 'write_to_file', path, options, on_end, }
    // return @mark_as_sink R, description
    return this.write_to_nodejs_stream(FS.createWriteStream(path, options), on_end);
  };

  // #-----------------------------------------------------------------------------------------------------------
  // @read_from_nodejs_stream = ( stream ) ->
  //   switch ( arity = arguments.length )
  //     when 1 then null
  //     else throw new Error "µ9983 expected 1 argument, got #{arity}"
  //   #.........................................................................................................
  //   return TO_PULL_STREAM.source stream, ( error ) -> finish error

  //-----------------------------------------------------------------------------------------------------------
  this.write_to_nodejs_stream = function(stream, on_end) {
    /* TAINT consider to abandon all sinks except `$drain()` and use throughs with writers instead */
    /* TAINT code duplication */
    var arity, finish, has_finished, last, pipeline;
    switch ((arity = arguments.length)) {
      case 1:
      case 2:
        null;
        break;
      default:
        throw new Error(`µ9983 expected 1 or 2 arguments, got ${arity}`);
    }
    if (on_end != null) {
      validate.function(on_end);
    }
    has_finished = false;
    last = Symbol('last');
    //.........................................................................................................
    finish = function(error) {
      if (error != null) {
        has_finished = true;
        if (error != null) {
          throw error;
        }
      }
      if (!has_finished) {
        has_finished = true;
        if (on_end != null) {
          on_end();
        }
      }
      return null;
    };
    //.........................................................................................................
    stream.on('close', function() {
      return finish();
    });
    stream.on('error', function() {
      return finish(error);
    });
    // description = { [@marks.isa_sink], type: 'write_to_nodejs_stream', stream, on_end, }
    //.........................................................................................................
    pipeline = [];
    pipeline.push(this.$watch({last}, function(d) {
      if (d === last) {
        return stream.close();
      }
      return stream.write(d);
    }));
    pipeline.push(this.$drain(finish));
    //.........................................................................................................
    return this.pull(...pipeline);
  };

  // #-----------------------------------------------------------------------------------------------------------
// @node_stream_from_source = ( source ) -> TO_NODE_STREAM.source source

// #-----------------------------------------------------------------------------------------------------------
// @node_stream_from_sink = ( sink ) ->
//   ### TAINT consider to abandon all sinks except `$drain()` and use throughs with writers instead ###
//   R           = TO_NODE_STREAM.sink sink
//   description = { type: 'node_stream_from_sink', sink, }
//   return @mark_as_sink R, description

}).call(this);
