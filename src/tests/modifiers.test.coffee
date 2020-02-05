

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/TESTS/MODIFIERS'
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
# SP                        = require '../..'
# { $
#   $async
#   $watch
#   $show  }                = SP.export()
#...........................................................................................................
types                     = require '../types'
{ isa
  validate
  type_of }               = types
#...........................................................................................................
read                      = ( path ) -> FS.readFileSync path, { encoding: 'utf-8', }
defer                     = setImmediate
{ inspect, }              = require 'util'
xrpr                      = ( x ) -> inspect x, { colors: yes, breakLength: Infinity, maxArrayLength: Infinity, depth: Infinity, }
jr                        = JSON.stringify


#-----------------------------------------------------------------------------------------------------------
@[ "modifiers ($before)" ] = ( T, done ) ->
  SP = require '../..'
  #.........................................................................................................
  { $
    $async
    $drain
    $before
    $show } = SP.export()
  #.........................................................................................................
  $transform = =>
    return $before ( send ) ->
      debug '^12287^'
      send "may I introduce"
  #.........................................................................................................
  do =>
    source    = "Behind the Looking-Glass".split /\s+/
    matcher   = ["may I introduce","Behind","the","Looking-Glass"]
    pipeline  = []
    pipeline.push source
    pipeline.push $transform()
    pipeline.push $show()
    pipeline.push $drain ( result ) =>
      help jr result
      T.eq result, matcher
      done()
    SP.pull pipeline...
    return null
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "modifiers ($after)" ] = ( T, done ) ->
  SP = require '../..'
  #.........................................................................................................
  { $
    $async
    $drain
    $after
    $show } = SP.export()
  #.........................................................................................................
  $transform = =>
    return $after ( send ) ->
      debug '^12287^'
      send "is an interesting book"
  #.........................................................................................................
  do =>
    source    = "Behind the Looking-Glass".split /\s+/
    matcher   = ["Behind","the","Looking-Glass","is an interesting book"]
    pipeline  = []
    pipeline.push source
    pipeline.push $transform()
    pipeline.push $show()
    pipeline.push $drain ( result ) =>
      help jr result
      T.eq result, matcher
      done()
    SP.pull pipeline...
    return null
  #.........................................................................................................
  return null


############################################################################################################
unless module.parent?
  test @
  # test @[ "modifiers ($before)" ]
  # test @[ "modifiers ($after)" ]







