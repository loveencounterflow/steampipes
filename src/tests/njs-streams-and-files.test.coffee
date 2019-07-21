



'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/TESTS/NJS-STREAMS-AND-FILES'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
PATH                      = require 'path'
FS                        = require 'fs'
OS                        = require 'os'
test                      = require 'guy-test'
{ jr }                    = CND
#...........................................................................................................
SP                        = require '../..'
{ $
  $async
  $watch
  $show  }                = SP.export()
defer                     = setImmediate
types                     = require '../types'
{ isa
  validate
  type_of }               = types

#-----------------------------------------------------------------------------------------------------------
@[ "write to file sync" ] = ( T, done ) ->
  ### TAINT use proper tmpfile ###
  path      = '/tmp/steampipes-testfile.txt'
  FS.unlinkSync path if FS.existsSync path
  probe     = "just a bunch of words really".split /\s+/
  matcher   = null
  error     = null
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    R           = []
    source      = probe
    #.......................................................................................................
    pipeline    = []
    pipeline.push source
    pipeline.push $ ( d, send ) -> send d + '\n'
    pipeline.push $watch ( d ) -> info 'mainline', jr d
    # pipeline.push SP.tee_write_to_file path
    pipeline.push SP.tee_write_to_file_sync path
    pipeline.push SP.$drain ( sink ) ->
      matcher = sink.join ''
      if FS.existsSync path then  result  = FS.readFileSync path, { encoding: 'utf-8', }
      else                        result  = null
      # urge 'µ77655', ( jr result ), ( jr matcher )
      T.eq result, matcher
      help 'ok'
      resolve null
    SP.pull pipeline...
    return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "read_from_file" ] = ( T, done ) ->
  ### TAINT use proper tmpfile ###
  path      = __filename
  probe     = null
  matcher   = null
  error     = null
  sink      = []
  matcher   = FS.readFileSync path, { encoding: 'utf-8', }
  #.......................................................................................................
  pipeline = []
  pipeline.push SP.read_from_file path, 10
  pipeline.push $show()
  pipeline.push SP.$drain ( sink ) ->
    result  = ( Buffer.concat sink ).toString 'utf-8'
    T.eq result, matcher
    help 'ok'
    done()
  SP.pull pipeline...
  return null

#-----------------------------------------------------------------------------------------------------------
as_chunked_buffers = ( text, size ) ->
  validate.text text
  validate.positive_integer size
  R       = []
  buffer  = Buffer.from text
  for idx in [ 0 ... buffer.length ] by size
    R.push buffer.slice idx, idx + size
  return R

#-----------------------------------------------------------------------------------------------------------
@[ "$split" ] = ( T, done ) ->
  ### TAINT use proper tmpfile ###
  path      = __filename
  probes_and_matchers = [
    [[ """A text that\nextends over several lines\näöüÄÖÜß""", '\n'],null,null]
    [[ """A text that\nextends over several lines\näöüÄÖÜß""", 'ä'],null,null]
    [[ """A text that\nextends over several lines\näöüÄÖÜß""", 'ö'],null,null]
    ]
  for [ probe, matcher, error, ] in probes_and_matchers
    [ text
      splitter ]  = probe
    matcher       = text.split splitter
    await T.perform [ text, splitter, ], matcher, error, -> return new Promise ( resolve, reject ) ->
      values        = as_chunked_buffers text, 3
      pipeline      = []
      pipeline.push values
      pipeline.push SP.$split splitter
      pipeline.push $watch ( d ) -> info jr d
      # pipeline.push SP.tee_write_to_file path
      pipeline.push SP.$drain ( result ) -> resolve result
      SP.pull pipeline...
      return null
  #.........................................................................................................
  done()
  return null


############################################################################################################
unless module.parent?
  test @, 'timeout': 30000
  # test @[ "read_from_file" ]
  # test @[ "$split" ]




