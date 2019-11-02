

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/TESTS/WYE2'
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
#...........................................................................................................
SP                        = require '../..'
{ $
  $async
  $drain
  $watch
  $show  }                = SP.export()



#-----------------------------------------------------------------------------------------------------------
@[ "mutiple sources" ] = ( T, done ) ->
  [ probe, matcher, error, ] = [["abcdef","1234"],"A1B2C3D4EF",null]
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    [ source_1
      source_2 ]  = probe
    pipeline      = []
    pipeline.push source_1
    pipeline.push source_2
    pipeline.push $ ( d, send ) -> send d.toUpperCase()
    pipeline.push $show { title: 'µ53211', }
    pipeline.push $drain ( Σ ) -> resolve Σ.join ''
    SP.pull pipeline...
    return null
  #.........................................................................................................
  done()
  return null




############################################################################################################
unless module.parent?
  # test @, 'timeout': 30000
  test @[ "mutiple sources" ]







