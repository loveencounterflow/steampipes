

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

#-----------------------------------------------------------------------------------------------------------
@[ "texts, lists, generators etc" ] = ( T, done ) ->
  probes_and_matchers = [
    ["abcde𫠠𫠡𫠢𫠣",["a","b","c","d","e","𫠠","𫠡","𫠢","𫠣"],null]
    [["a","b","c","d","e","𫠠","𫠡","𫠢","𫠣"],["a","b","c","d","e","𫠠","𫠡","𫠢","𫠣"],null]
    [ ( new Set "abcde𫠠𫠡𫠢𫠣" ),["a","b","c","d","e","𫠠","𫠡","𫠢","𫠣"],null]
    [ ( new Map [[ "abcde", "𫠠𫠡𫠢𫠣" ]] ),[["abcde","𫠠𫠡𫠢𫠣"]],null]
    [ ( -> yield 'a'; yield '𫠠' )(), ["a","𫠠"],null]
    # [{foo:42}]
    ]
  for [ probe, matcher, error, ] in probes_and_matchers
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
  probes_and_matchers = [
    [ ( -> yield 'a'; yield '𫠠' ), ["a","𫠠"],null]
    ]
  for [ probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'generatorfunction'
      debug '^55573-1^', type_of probe[ Symbol.iterator ]
      probe = probe()
      T.eq ( type_of probe ), 'generator'
      debug '^55573-2^', type_of probe[ Symbol.iterator ]
      for d from probe
        # urge jr d
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "asyncgeneratorfunction" ] = ( T, done ) ->
  probes_and_matchers = [
    [ (  -> await 42; yield 1; yield 2; yield 3 ), [ 1, 2, 3, ],null]
    ]
  for [ probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'asyncgeneratorfunction'
      probe = probe()
      # T.eq ( type_of probe ), 'asyncgenerator'
      # debug '^55573-2^', type_of probe[ Symbol.asyncIterator ]
      for await d from probe
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
  myIterable =
    [Symbol.iterator]: ->
        yield 1;
        yield 2;
        yield 3;
  myIterable_2 =
    [Symbol.iterator]: -> [ 1, 2, 3, ]
  probes_and_matchers = [
    [ myIterable,   [1,2,3],null]
    [ myIterable_2, [1,2,3],null]
    ]
  for [ probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      result = []
      T.eq ( type_of probe ), 'object'
      T.ok ( type_of probe[ Symbol.iterator ] ) in [ 'generatorfunction', 'function', ]
      probe = probe[ Symbol.iterator ]()
      # debug '^223331^', types_of probe
      # T.eq ( type_of probe ), 'generator'
      for d from probe
        # urge jr d
        result.push d
      resolve result
      return null
  #.........................................................................................................
  done()
  return null


############################################################################################################
unless module.parent?
  test @
  # test @[ "leapfrogging compared to wye" ]
  # test @[ "wye construction (sync)" ]
  # test @[ "wye construction (async)" ]
  # test @[ "wye construction (method)" ]
  # test @[ "wye construction (source, transform, drain ducts)" ]

