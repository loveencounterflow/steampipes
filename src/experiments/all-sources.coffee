

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/TESTS/ALL-SOURCES'
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
{ jr, }                   = CND
#...........................................................................................................
{ isa
  validate
  defaults
  types_of
  type_of }               = require '../types'
#...........................................................................................................
SP                        = require '../..'
{ $
  $async
  $drain
  $watch
  $show  }                = SP.export()
#...........................................................................................................
rpad                      = ( x, P... ) -> x.padEnd   P...
lpad                      = ( x, P... ) -> x.padStart P...
sleep                     = ( dts ) -> new Promise ( done ) => setTimeout done, dts * 1000



#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_get_custom_iterable_1 = ->
  ### ths to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols ###
  myIterable =
    [Symbol.iterator]: ->
        yield "𫠠"
        yield "𫠡"
        yield "𫠢"
  return [ 'mdn_custom_iterable', myIterable, ["𫠠","𫠡","𫠢",], null, ]

#-----------------------------------------------------------------------------------------------------------
@_get_custom_iterable_2 = ->
  myIterable_2 =
    [Symbol.iterator]: -> yield from ["𫠠","𫠡","𫠢",]
  return [ 'object_with_list_as_iterator', myIterable_2, ["𫠠","𫠡","𫠢",], null, ]

#-----------------------------------------------------------------------------------------------------------
@_get_standard_iterables = ->
  return [
    [ 'text',       "𫠠𫠡𫠢",["𫠠","𫠡","𫠢",],null]
    [ 'list',       ["𫠠","𫠡","𫠢",],["𫠠","𫠡","𫠢",],null]
    [ 'set',        ( new Set "𫠠𫠡𫠢" ),["𫠠","𫠡","𫠢",],null]
    [ 'map',        ( new Map [[ "𫠠", "𫠡𫠢" ]] ),[[ "𫠠", "𫠡𫠢" ]],null]
    [ 'generator',  ( -> yield '𫠠'; yield '𫠡'; yield '𫠢')(), ["𫠠","𫠡","𫠢",],null]
    ]

#-----------------------------------------------------------------------------------------------------------
@_get_generatorfunction = ->
  return [ 'generatorfunction', ( -> yield '𫠠'; yield '𫠡'; yield '𫠢' ), ["𫠠","𫠡","𫠢",],null]

#-----------------------------------------------------------------------------------------------------------
@_get_asyncgenerator = ->
  return [ 'asyncgenerator', ( -> await 42; yield '𫠠'; yield '𫠡'; yield '𫠢' )(), ["𫠠","𫠡","𫠢",],null]

#-----------------------------------------------------------------------------------------------------------
@_get_asyncgeneratorfunction = ->
  return [ 'asyncgeneratorfunction', ( -> await 42; yield '𫠠'; yield '𫠡'; yield '𫠢' ), ["𫠠","𫠡","𫠢",],null]

#-----------------------------------------------------------------------------------------------------------
@_get_function      = -> [ 'function',      ( ->           ["𫠠","𫠡","𫠢",] ), ["𫠠","𫠡","𫠢",]. null, ]
@_get_asyncfunction = -> [ 'asyncfunction', ( -> await 42; ["𫠠","𫠡","𫠢",] ), ["𫠠","𫠡","𫠢",]. null, ]

#-----------------------------------------------------------------------------------------------------------
@_get_all_probes_and_matchers = ->
  return [
    @_get_standard_iterables()...
    @_get_custom_iterable_2()
    @_get_generatorfunction()
    @_get_asyncgenerator()
    @_get_asyncgeneratorfunction()
    @_get_custom_iterable_1()
    @_get_function()
    @_get_asyncfunction()
    ]

#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@[ "texts, lists, generators etc" ] = ( T, done ) ->
  probes_and_matchers = @_get_standard_iterables()
  for [ name, probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe[ Symbol.iterator ] ), 'function'
      ### NOTE that `for d from x` works on code*points* whereas `for d in x` works on code*units* ###
      ### NOTE we use `for d from probe[ Symbol.iterator ]()` instead of for d from probe` b/c it is more
      general ###
      for d from probe[ Symbol.iterator ]()
        # urge jr d
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "generatorfunction" ] = ( T, done ) ->
  probes_and_matchers = [ @_get_generatorfunction(), ]
  for [ name, probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'generatorfunction'
      # debug '^55573-1^', type_of probe[ Symbol.iterator ]
      probe = probe()
      T.eq ( type_of probe ), 'generator'
      # debug '^55573-2^', type_of probe[ Symbol.iterator ]
      for d from probe[ Symbol.iterator ]()
        # urge jr d
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "asyncgenerator" ] = ( T, done ) ->
  probes_and_matchers = [ @_get_asyncgenerator(), ]
  for [ name, probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'asyncgenerator'
      T.eq ( type_of probe[ Symbol.asyncIterator ] ), 'function'
      T.eq ( type_of probe[ Symbol.asyncIterator ]() ), 'asyncgenerator'
      for await d from probe[ Symbol.asyncIterator ]()
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "asyncgeneratorfunction" ] = ( T, done ) ->
  probes_and_matchers = [ @_get_asyncgeneratorfunction(), ]
  for [ name, probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'asyncgeneratorfunction'
      probe = probe()
      T.eq ( type_of probe ), 'asyncgenerator'
      T.eq ( type_of probe[ Symbol.asyncIterator ] ), 'function'
      for await d from probe[ Symbol.asyncIterator ]()
        # urge jr d
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "custom iterable" ] = ( T, done ) ->
  ### NOTE: treatment of custom iterables is already dealt with in `@[ "texts, lists, generators etc" ]`
  since there, too, `probe[ Symbol.iterator ]()` is used in the `for d from x` loop ###
  ### see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators ###
  probes_and_matchers = [
    @_get_custom_iterable_1()
    @_get_custom_iterable_2()
    ]
  for [ name, probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'object'
      debug '^5777764^', type_of probe[ Symbol.iterator ]
      T.ok ( type_of probe[ Symbol.iterator ] ) in [ 'generatorfunction', 'function', ]
      for d from probe[ Symbol.iterator ]()
        # urge jr d
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "tabulate distinctive features" ] = ( T, done ) ->
  await do =>
    probes_and_matchers = @_get_all_probes_and_matchers()
    for [ name, probe, ] in probes_and_matchers
      #.....................................................................................................
      ### STEP 1 ###
      mode                  = 'sync'
      probe_type            = type_of probe
      #.....................................................................................................
      if probe_type in [ 'generatorfunction', 'asyncgeneratorfunction', ]
        probe                 = probe()
        probe_type            = type_of probe
      #.....................................................................................................
      ### STEP 2 ###
      iterator              = probe[ Symbol.iterator ]
      iterator_type         = type_of iterator
      iterator_return_type  = './.'
      #.....................................................................................................
      if iterator_type is 'function'
        ### TAINT should not call iterator before ready; here done for illustration ###
        iterator_return_type = type_of iterator.apply probe
      #.....................................................................................................
      ### STEP 3 ###
      async_iterator        = undefined
      async_iterator_type   = 'undefined'
      unless iterator?
        async_iterator            = probe[ Symbol.asyncIterator ]
        async_iterator_type       = type_of async_iterator
        mode                      = 'async'
      #.....................................................................................................
      iterator_type             = './.' if iterator_type is 'undefined'
      async_iterator_type       = './.' if async_iterator_type is 'undefined'
      #.....................................................................................................
      ### STEP 4 ###
      switch mode
        when 'sync'   then  result = ( d for        d from       iterator.apply probe )
        when 'async'  then  result = ( d for await  d from async_iterator.apply probe )
      #.....................................................................................................
      name_txt                  = CND.blue  rpad  name,                   30
      probe_type_txt            = CND.gold  rpad  probe_type,             23
      mode_txt                  = CND.steel lpad  mode,                    5
      iterator_type_txt         = CND.gold  rpad  iterator_type,          20
      iterator_return_type_txt  = CND.lime  rpad  iterator_return_type,   20
      async_iterator_type_txt   = CND.gold  rpad  async_iterator_type,    20
      result_txt                = CND.green rpad  ( jr result )[ .. 15 ], 15
      probe_txt                 = CND.grey  ( ( rpr probe ).replace /\s+/g, ' ' )[ .. 40 ]
      #.....................................................................................................
      echo \
        name_txt,
        probe_type_txt,
        mode_txt,
        iterator_type_txt,
        ( CND.white '->' ),
        iterator_return_type_txt,
        async_iterator_type_txt,
        result_txt
        # probe_txt
  done()

#-----------------------------------------------------------------------------------------------------------
@[ "normalize_source" ] = ( T, done ) ->
  SP._normalize_source = ( probe ) ->
    #.......................................................................................................
    ### STEP 1 ###
    mode                  = 'sync'
    original_probe_type   = type_of probe
    #.......................................................................................................
    if ( probe_type = type_of probe ) in [ 'generatorfunction', 'asyncgeneratorfunction', ]
      probe                 = probe()
      probe_type            = type_of probe
    #.......................................................................................................
    ### STEP 2 ###
    iterator = probe[ Symbol.iterator ]
    #.......................................................................................................
    unless iterator? # ( iterator_type = type_of iterator ) is 'function'
      #.....................................................................................................
      ### STEP 3 ###
      mode            = 'async'
      async_iterator  = probe[ Symbol.asyncIterator ]
      debug '^33321^', ( type_of async_iterator )
      debug '^33321^', probe
    #.......................................................................................................
    unless ( mode is 'sync' and iterator? ) or ( mode is 'async' and async_iterator? )
      throw new Error "^steampipes/_normalize_source@33371^ unable to produce iterator for source type #{rpr original_probe_type}"
    # debug '^3332^', mode, iterator
    #.......................................................................................................
    ### STEP 4 ###
    if mode is 'sync' then  iterate = ->       iterator.apply probe
    else                    iterate = -> async_iterator.apply probe
    #.......................................................................................................
    return { mode, iterate, }
  await do =>
    probes_and_matchers = @_get_all_probes_and_matchers()
    for [ name, probe, matcher, error, ] in probes_and_matchers
      matcher = [] # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
        result = []
        whisper '-------------------'
        info name
        { mode, iterate, } = SP._normalize_source probe
        switch mode
          when 'sync'   then result.push d for        d from iterate()
          when 'async'  then result.push d for await  d from iterate()
          else throw new Error "µ498283 unknown iterator mode #{rpr mode}"
        resolve result
    done()

#-----------------------------------------------------------------------------------------------------------
@[ "iterate" ] = ( T, done ) ->
  probes_and_matchers = @_get_all_probes_and_matchers()
  check_count         = 0
  hit_count           = 0
  #.........................................................................................................
  for [ name, source, matcher, error, ] in probes_and_matchers
    check_count++
    source    = source() if ( type_of source ) in [ 'generatorfunction', 'asyncgeneratorfunction', ]
    type      = type_of source
    error     = null
    name_txt  = CND.blue rpad name, 30
    debug '^233^', type
    try
      if type is 'asyncgenerator'
        info name_txt, ( CND.green 'sync ' ), ( CND.grey type ), ( CND.blue result = ( d for await d from source ) )
      else
        info name_txt, ( CND.red   'async' ), ( CND.grey type ), ( CND.blue result = ( d for       d from source ) )
    catch error
      warn name_txt, ( CND.grey type ), ( CND.red error.message )
    unless error?
      hit_count++ if CND.equals result, matcher
  #.........................................................................................................
  urge "#{hit_count} / #{check_count}"
  #.........................................................................................................
  done()

############################################################################################################
if module is require.main then do =>
  # test @, { timeout: 5000, }
  test @[ "iterate" ].bind @
  # test @[ "tabulate distinctive features" ].bind @
  # test @[ "wye construction (async)" ]
  # test @[ "wye construction (method)" ]
  # test @[ "generatorfunction" ]
  # test @[ "asyncgeneratorfunction" ]

