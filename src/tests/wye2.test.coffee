

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
@[ "wye2 tentaitve implementation" ] = ( T, done ) ->
  # The proper way to end a push source is to call `source.end()`.
  [ probe, matcher, error, ] = ['abcde','A(a)B(b)C(c)D(d)E(e)',null]
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    pipeline  = []
    common    = []
    t1        = $ ( d, send ) ->
      info 'µ98773', d
      send d
      wye.send d.toUpperCase()
    wye       = ( d, send ) ->
      help 'µ98779', d
      send d
    wye.sink   = common
    wye        = $ wye
    # common    = new Proxy
    pipeline.push 'abcde'
    pipeline.push t1
    pipeline.push $ ( d, send ) -> send "(#{d})"
    pipeline.push wye
    pipeline.push $drain ( Σ ) ->
      info Σ.join ''
      resolve Σ.join ''
      help 'ok'
    SP.pull pipeline...
    return null
  #.........................................................................................................
  done()
  return null


############################################################################################################
unless module.parent?
  test @, 'timeout': 30000







