

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
@[ "tentative implementation" ] = ( T, done ) ->
  [ probe, matcher, error, ] = ["abcde","(a)A(b)B(c)C(d)D(e)E",null]
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    pipeline  = []
    t1        = $ ( d, send ) ->
      send d
      wye.send "(#{d})"
    wye        = SP.$pass()
    pipeline.push probe
    pipeline.push t1
    pipeline.push $ ( d, send ) -> send d.toUpperCase()
    pipeline.push wye
    pipeline.push $drain ( Σ ) -> resolve Σ.join ''
    SP.pull pipeline...
    return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "leapfrogging compared to wye" ] = ( T, done ) ->
  [ probe, matcher, error, ] = ["abcde","aBCdE",null]
  results = []
  #.........................................................................................................
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    pipeline  = []
    pipeline.push probe
    pipeline.push $ ( d, send ) ->
      if ( d.match /a|d/ )?  then  wye.send d
      else                        send d
    pipeline.push $ ( d, send ) -> send d.toUpperCase()
    pipeline.push wye = SP.$pass()
    pipeline.push $drain ( Σ ) ->
      results.push R = Σ.join ''
      resolve R
    SP.pull pipeline...
    return null
  #.........................................................................................................
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    leapfrog  = ( d ) -> ( d.match /a|d/ )?
    pipeline  = []
    pipeline.push probe
    pipeline.push $ { leapfrog, }, ( d, send ) -> send d.toUpperCase()
    pipeline.push wye = SP.$pass()
    pipeline.push $drain ( Σ ) ->
      results.push R = Σ.join ''
      resolve R
    SP.pull pipeline...
    return null
  #.........................................................................................................
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    pipeline    = []
    pipeline.push probe
    # pipeline.push $show()
    pipeline.push SP.leapfrog ( ( d ) -> ( d.match /a|d/ )? ), $ ( d, send ) -> send d.toUpperCase()
    pipeline.push wye = SP.$pass()
    pipeline.push $drain ( Σ ) ->
      results.push R = Σ.join ''
      resolve R
    SP.pull pipeline...
    return null
  #.........................................................................................................
  T.eq results.length, 3
  T.eq results...
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "wye 2" ] = ( T, done ) ->
  [ probe, matcher, error, ] = ["a","[a](a)A",null]
  # [ probe, matcher, error, ] = ['abcde','A(a)B(b)C(c)D(d)E(e)',null]
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    t1 = $ ( d, send ) ->
      wye.send "[#{d}]"
      wye.send "(#{d})"
      send d
    pipeline  = []
    pipeline.push probe
    pipeline.push t1
    pipeline.push $ ( d, send ) -> send d.toUpperCase()
    pipeline.push wye = SP.$pass()
    pipeline.push $drain ( Σ ) -> resolve Σ.join ''
    SP.pull pipeline...
    return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "wye 3" ] = ( T, done ) ->
  [ probe, matcher, error, ] = [[24],[12,6,3,10,5,16,8,4,2,1],null]
  # [ probe, matcher, error, ] = ['abcde','A(a)B(b)C(c)D(d)E(e)',null]
  await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
    source    = SP.new_push_source()
    pipeline  = []
    pipeline.push source
    # pipeline.push wye = SP.$pass()
    # pipeline.push $show()
    pipeline.push $ ( d, send ) -> send if ( d %% 2 is 0 ) then ( d / 2 ) else ( d * 3 + 1 )
    pipeline.push $show()
    pipeline.push $ ( d, send ) -> send d; if ( d is 1 ) then source.end() else source.send d
    pipeline.push $drain ( Σ ) -> resolve Σ
    SP.pull pipeline...
    source.send d for d in probe
    return null
  #.........................................................................................................
  done()
  return null



############################################################################################################
unless module.parent?
  test @, 'timeout': 30000
  # test @[ "leapfrogging compared to wye" ]
  # test @[ "wye 3" ]







