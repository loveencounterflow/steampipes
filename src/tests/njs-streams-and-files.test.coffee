



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


############################################################################################################
unless module.parent?
  test @, 'timeout': 30000




