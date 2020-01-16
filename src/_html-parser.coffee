
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
# SP                        = require '..'
# { $
#   $async
#   $drain
#   $watch
#   $show  }                = SP.export()
#...........................................................................................................
DATOM                     = new ( require 'datom' ).Datom { dirty: false, }
{ new_datom
  wrap_datom
  # lets
  select }                = DATOM.export()
#...........................................................................................................
Multimix                  = require 'multimix'
HtmlParser                = require 'atlas-html-stream'
L                         = @

#-----------------------------------------------------------------------------------------------------------
@new_onepiece_parser  = -> @_new_parse_method false
@new_piecemeal_parser = -> @_new_parse_method true

#-----------------------------------------------------------------------------------------------------------
@_new_parse_method = ( piecemeal ) ->
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
  R = ( html ) =>
    R = []
    parser.write html
    unless piecemeal
      parser.flushText()
      parser.reset()
    return R
  #.........................................................................................................
  R.flush = -> parser.flushText()
  R.reset = -> parser.reset()
  return R

#-----------------------------------------------------------------------------------------------------------
class Htmlparser extends Multimix
  # @extend   object_with_class_properties
  @include L

  #---------------------------------------------------------------------------------------------------------
  constructor: ( @settings = null ) ->
    super()
    # @specs    = {}
    # @isa      = Multimix.get_keymethod_proxy @, isa
    # # @validate = Multimix.get_keymethod_proxy @, validate
    # declarations.declare_types.apply @

############################################################################################################
module.exports  = new Htmlparser()




