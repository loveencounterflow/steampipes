

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
    [Symbol.iterator]: -> ["𫠠","𫠡","𫠢",]
  return [ 'object_with_list_as_iterator', myIterable_2, ["𫠠","𫠡","𫠢",], null, ]

#-----------------------------------------------------------------------------------------------------------
@_get_standard_iterables = ->
  return [
    [ 'text',       "𫠠𫠡𫠢",["𫠠","𫠡","𫠢",],null]
    [ 'list',       ["𫠠","𫠡","𫠢",],["𫠠","𫠡","𫠢",],null]
    [ 'set',        ( new Set "abcde𫠠𫠡𫠢𫠣" ),["a","b","c","d","e","𫠠","𫠡","𫠢","𫠣"],null]
    [ 'map',        ( new Map [[ "abcde", "𫠠𫠡𫠢𫠣" ]] ),[["abcde","𫠠𫠡𫠢𫠣"]],null]
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
  do =>
    probes_and_matchers = [
      @_get_standard_iterables()...
      @_get_custom_iterable_2()
      @_get_generatorfunction()
      @_get_asyncgenerator()
      @_get_asyncgeneratorfunction()
      @_get_custom_iterable_1()
      ]
    for [ name, probe, ] in probes_and_matchers
      mode                  = 'sync'
      probe_type            = type_of probe
      #.....................................................................................................
      if probe_type in [ 'generatorfunction', 'asyncgeneratorfunction', ]
        probe                 = probe()
        probe_type            = type_of probe
      #.....................................................................................................
      iterator              = probe[ Symbol.iterator ]
      iterator_type         = type_of iterator
      iterator_return_type  = './.'
      #.....................................................................................................
      if iterator_type is 'function'
        ### TAINT should not call iterator before ready; here done for illustration ###
        iterator_return_type = type_of iterator.apply probe
      #.....................................................................................................
      async_iterator        = undefined
      async_iterator_type   = 'undefined'
      unless iterator?
        async_iterator            = probe[ Symbol.asyncIterator ]
        async_iterator_type       = type_of async_iterator
        mode                      = 'async'
      #.....................................................................................................
      iterator_type             = './.' if iterator_type is 'undefined'
      async_iterator_type       = './.' if async_iterator_type is 'undefined'
      # #.....................................................................................................
      # generator                 = null
      # if iterator_type is 'generatorfunction'
      #   debug iterator.apply probe
      # #.....................................................................................................
      # else if async_iterator_type is 'asyncgeneratorfunction'
      #   debug async_iterator.apply probe
      #.....................................................................................................
      debug mode
      switch mode
        when 'sync'   then  result = ( d for        d from       iterator.apply probe )
        when 'async'  then  result = null # ( d for await  d from async_iterator.apply probe )
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
@[ "_get iterator from source" ] = ( T, done ) ->
  SP._iterator_from_source = ( source ) ->
    mode          = 'sync'
    iterator      = source[ Symbol.iterator ]
    iterator_type = type_of iterator
    if type in [ 'generatorfunction', 'asyncgeneratorfunction', ]
      source        = source()
      iterator      = source[ Symbol.iterator ]
      iterator_type = type_of iterator
      mode          = 'async' if type is 'asyncgeneratorfunction'
    if iterator_type is 'function'
      iterator = iterator()
      return { mode, iterator, }
    iterator      = source[ Symbol.asyncIterator ]
    iterator_type = type_of iterator

    # if
    #   when 'undefined'
    #     debug '^323336^>>>>>>>>>>>>>>>>', source

    #   else
    #     throw new Error "^steampipes/_iterator_from_source@33398^ unknown type #{rpr type} for source[ Symbol.iterator ]"
    type = type_of source
    throw new Error "^steampipes/_iterator_from_source@33399^ unable to produce iterator for source type #{rpr type}"
  do =>
    probes_and_matchers = [
      @_get_standard_iterables()...
      @_get_custom_iterable_2()
      @_get_custom_iterable_1()
      @_get_generatorfunction()
      @_get_asyncgeneratorfunction()
      ]
    for [ name, probe, matcher, error, ] in probes_and_matchers
      await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
        result = []
        debug probe
        { mode, iterator, } = SP._iterator_from_source probe
        switch mode
          when 'sync'
            for d from iterator
              result.push d
          when 'async'
            throw new Error "µ498282 async mode not implemented"
          else
            throw new Error "µ498283 unknown iterator mode #{rpr mode}"
        resolve result
    done()

############################################################################################################
unless module.parent?
  test @
  # test @[ "tabulate distinctive features" ].bind @
  # test @[ "wye construction (async)" ]
  # test @[ "wye construction (method)" ]
  # test @[ "generatorfunction" ]
  # test @[ "asyncgeneratorfunction" ]

