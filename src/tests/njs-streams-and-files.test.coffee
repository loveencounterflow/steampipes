



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


#-----------------------------------------------------------------------------------------------------------
@[ "write to file" ] = ( T, done ) ->
  path    = '/tmp/steampipes-testfile.txt'
  probe   = "just a bunch of words really".split /\s+/
  matcher = null
  error   = null
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    R           = []
    source      = probe
    sink        = SP.write_to_file path, ->
      help 'ok'
      T.eq duct.type, 'circuit'
      resolve null
    #.......................................................................................................
    pipeline    = []
    pipeline.push source
    pipeline.push $ ( d, send ) -> send d + '\n'
    pipeline.push $watch ( d ) -> info 'mainline', jr d
    pipeline.push sink
    duct = SP.pull pipeline...
    # debug 'µ44521', sink
    # debug 'µ44522', duct
    return null
  #.........................................................................................................
  done()
  return null


############################################################################################################
unless module.parent?
  test @, 'timeout': 30000




