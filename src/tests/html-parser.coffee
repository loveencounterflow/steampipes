

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/TESTS/HTML-PARSER'
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
  $watch
  $show  }                = SP.export()
#...........................................................................................................
read                      = ( path ) -> FS.readFileSync path, { encoding: 'utf-8', }
defer                     = setImmediate
{ inspect, }              = require 'util'
xrpr                      = ( x ) -> inspect x, { colors: yes, breakLength: Infinity, maxArrayLength: Infinity, depth: Infinity, }
jr                        = JSON.stringify

#-----------------------------------------------------------------------------------------------------------
probes_and_matchers = [
  ["<!DOCTYPE html>"]
  ["<title>MKTS</title>"]
  ["<document/>"]
  ["<foo bar baz=42>"]
  ["something"]
  ["<br/>"]
  ["else"]
  ["</thing>"]
  ["</foo>"]
  ["</document>"]
  ["<title>MKTS</title>"]
  ["<p foo bar=42>omg</p>"]
  ["<document/><foo bar baz=42>something<br/>else</thing></foo>"]
  ["<!DOCTYPE html><html lang=en><head><title>x</title></head><p data-x='<'>helo</p></html>"]
  ["<p foo bar=42><em>Yaffir stood high</em></p>"]
  ["<p foo bar=42><em><xxxxxxxxxxxxxxxxxxx>Yaffir stood high</p>"]
  ["<p föö bär=42><em>Yaffir stood high</p>"]
  ["<document 文=zh/><foo bar baz=42>something<br/>else</thing></foo>"]
  ["<p foo bar=<>yeah</p>"]
  ["<p foo bar='<'>yeah</p>"]
  ["<p foo bar='&lt;'>yeah</p>"]
  ["<<<<<"]
  ["𦇻𦑛𦖵𦩮𦫦𧞈"]
  ]

#-----------------------------------------------------------------------------------------------------------
@[ "_parse html to list" ] = ( T, done ) ->
  PARSER = require '../html-parser'
  #.........................................................................................................
  for [ probe, matcher, error, ] in probes_and_matchers
    matcher = null
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      R = null
      help CND.red html
      parse = PARSER.new_parse_method()
      for d in parse html
        if d.text?
          info d.$key, ( CND.white jr d.text )
        else
          if d.data? # and ( Object.keys d.data ).length > 0
            info d.$key, ( CND.yellow jr d.data )
          else
            info d.$key
      # R           = []
      # source      = probe
      # #.....................................................................................................
      # pipeline_A  = []
      # pipeline_A.push source
      # pipeline_A.push SP.$watch ( d ) -> info xrpr d
      # pipeline_A.push SP.$collect { collector: R, }
      # length_of_A = pipeline_A.length
      # duct_A = SP.pull pipeline_A...
      # T.eq duct_A.transforms.length,  length_of_A
      # T.eq duct_A.type,               'source'
      resolve R
      return null
    #.........................................................................................................
    done()
  return null


############################################################################################################
unless module.parent?
  # test @, 'timeout': 30000
  test @[ "parse html to list" ]







