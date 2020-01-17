

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
probes_and_matchers = [
  ["<!DOCTYPE html>",[{"data":{"html":true},"$key":"<!DOCTYPE"}],null]
  ["<title>MKTS</title>",[{"$key":"<title"},{"text":"MKTS","$key":"^text"},{"$key":">title"}],null]
  ["<document/>",[{"$key":"<document"},{"$key":">document"}],null]
  ["<foo bar baz=42>",[{"data":{"bar":true,"baz":"42"},"$key":"<foo"}],null]
  ["<br/>",[{"$key":"<br"},{"$key":">br"}],null]
  ["</thing>",[{"$key":">thing"}],null]
  ["</foo>",[{"$key":">foo"}],null]
  ["</document>",[{"$key":">document"}],null]
  ["<title>MKTS</title>",[{"$key":"<title"},{"text":"MKTS","$key":"^text"},{"$key":">title"}],null]
  ["<p foo bar=42>omg</p>",[{"data":{"foo":true,"bar":"42"},"is_block":true,"$key":"<p"},{"text":"omg","$key":"^text"},{"is_block":true,"$key":">p"}],null]
  ["<document/><foo bar baz=42>something<br/>else</thing></foo>",[{"$key":"<document"},{"$key":">document"},{"data":{"bar":true,"baz":"42"},"$key":"<foo"},{"text":"something","$key":"^text"},{"$key":"<br"},{"$key":">br"},{"text":"else","$key":"^text"},{"$key":">thing"},{"$key":">foo"}],null]
  ["<!DOCTYPE html><html lang=en><head><title>x</title></head><p data-x='<'>helo</p></html>",[{"data":{"html":true},"$key":"<!DOCTYPE"},{"data":{"lang":"en"},"$key":"<html"},{"$key":"<head"},{"$key":"<title"},{"text":"x","$key":"^text"},{"$key":">title"},{"$key":">head"},{"data":{"data-x":"<"},"is_block":true,"$key":"<p"},{"text":"helo","$key":"^text"},{"is_block":true,"$key":">p"},{"$key":">html"}],null]
  ["<p foo bar=42><em>Yaffir stood high</em></p>",[{"data":{"foo":true,"bar":"42"},"is_block":true,"$key":"<p"},{"$key":"<em"},{"text":"Yaffir stood high","$key":"^text"},{"$key":">em"},{"is_block":true,"$key":">p"}],null]
  ["<p foo bar=42><em><xxxxxxxxxxxxxxxxxxx>Yaffir stood high</p>",[{"data":{"foo":true,"bar":"42"},"is_block":true,"$key":"<p"},{"$key":"<em"},{"$key":"<xxxxxxxxxxxxxxxxxxx"},{"text":"Yaffir stood high","$key":"^text"},{"is_block":true,"$key":">p"}],null]
  ["<p föö bär=42><em>Yaffir stood high</p>",[{"data":{"föö":true,"bär":"42"},"is_block":true,"$key":"<p"},{"$key":"<em"},{"text":"Yaffir stood high","$key":"^text"},{"is_block":true,"$key":">p"}],null]
  ["<document 文=zh/><foo bar baz=42>something<br/>else</thing></foo>",[{"data":{"文":"zh"},"$key":"<document"},{"$key":">document"},{"data":{"bar":true,"baz":"42"},"$key":"<foo"},{"text":"something","$key":"^text"},{"$key":"<br"},{"$key":">br"},{"text":"else","$key":"^text"},{"$key":">thing"},{"$key":">foo"}],null]
  ["<p foo bar=<>yeah</p>",[{"data":{"foo":true,"bar":"<"},"is_block":true,"$key":"<p"},{"text":"yeah","$key":"^text"},{"is_block":true,"$key":">p"}],null]
  ["<p foo bar='<'>yeah</p>",[{"data":{"foo":true,"bar":"<"},"is_block":true,"$key":"<p"},{"text":"yeah","$key":"^text"},{"is_block":true,"$key":">p"}],null]
  ["<p foo bar='&lt;'>yeah</p>",[{"data":{"foo":true,"bar":"&lt;"},"is_block":true,"$key":"<p"},{"text":"yeah","$key":"^text"},{"is_block":true,"$key":">p"}],null]
  ["<<<<<",[{"text":"<<<<","$key":"^text"}],null]
  ["something",[{"text":"something","$key":"^text"}],null]
  ["else",[{"text":"else","$key":"^text"}],null]
  ["<p>dangling",[{"is_block":true,"$key":"<p"},{"text":"dangling","$key":"^text"}],null]
  ["𦇻𦑛𦖵𦩮𦫦𧞈",[{"text":"𦇻𦑛𦖵𦩮𦫦𧞈","$key":"^text"}],null]
  ]

#-----------------------------------------------------------------------------------------------------------
show = ( html, datoms ) ->
  help CND.red html
  for d in datoms
    if d.text?
      info d.$key, ( CND.white jr d.text )
    else
      if d.data? # and ( Object.keys d.data ).length > 0
        info d.$key, ( CND.yellow jr d.data )
      else
        info d.$key
  return null

#-----------------------------------------------------------------------------------------------------------
@[ "parse html to list (onepiece)" ] = ( T, done ) ->
  SP = require '../..'
  T.eq ( type_of SP.HTML.new_onepiece_parser ), 'function'
  parse = SP.HTML.new_onepiece_parser()
  #.........................................................................................................
  for [ probe, matcher, error, ] in probes_and_matchers
    await T.perform probe, matcher, error, -> return new Promise ( resolve, reject ) ->
      html    = probe
      result  = parse html
      # show html, result
      resolve result
      return null
  #.........................................................................................................
  done()
  return null

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

############################################################################################################
unless module.parent?
  # test @, 'timeout': 30000
  test @[ "parse html to list (onepiece)" ]







