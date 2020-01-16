
'use strict'

############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/HTML-PARSER'
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
types                     = require './types'
{ isa
  validate
  cast
  last_of
  type_of }               = types
# SP                        = require './main'
# debug SP
# { $
#   $async
#   $watch
#   $show
#   $drain }                = SP.export()
#...........................................................................................................
DATOM                     = new ( require 'datom' ).Datom { dirty: false, }
{ new_datom
  wrap_datom
  # lets
  select }                = DATOM.export()
#...........................................................................................................
HtmlParser                = require 'atlas-html-stream'


### NOTE

below are first steps to build an MKTS-compatible HTML parser from scratch; this will probably not be
continued because [`atlas-html-stream`](https://github.com/atlassubbed/atlas-html-stream) looks like a good
solution (except we still have too look for opening tags since some MKTS tags can use their own content
parsers).

#-----------------------------------------------------------------------------------------------------------
attributes_pattern        = /\b([a-z][a-z0-9\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;

#-----------------------------------------------------------------------------------------------------------
@parse_attributes = ( attributes ) ->
  # thx to https://github.com/taoqf/node-html-parser/blob/master/src/index.ts#L497
  R = {}
  return R if ( attributes.length is 0 )
  # attributes_pattern.
  debug attributes_pattern.lastIndex
  while ( match = attributes_pattern.exec attributes )?
    debug attributes_pattern.lastIndex
    R[ match[ 1 ] ] = match[ 2 ] ? match[ 3 ] ? match[ 4 ] ? true
  return R

#-----------------------------------------------------------------------------------------------------------
@parse_tag = ( tag ) ->

###


#-----------------------------------------------------------------------------------------------------------
@new_parse_method = ->
  R       = null
  parser  = new HtmlParser { preserveWS: true, }
  #.........................................................................................................
  parser.on 'data', ( { name, data, text, } ) =>
    return R.push new_datom '^text', { text, } if text?
    return R.push new_datom '>' + name unless data?
    has_keys = false
    for key, value of data
      has_keys    = true
      data[ key ] = true if value is ''
    return R.push new_datom '<' + name unless has_keys
    return R.push new_datom '<' + name, { data, }
  parser.on 'error', ( error ) -> throw error
  # parser.on 'end', -> R.push new_datom '^stop'
  #.........................................................................................................
  return ( html ) =>
    R = []
    parser.write html
    parser.reset()
    return R



