

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/STANDARD-TRANSFORMS'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
{ jr }                    = CND
assign                    = Object.assign
#...........................................................................................................
{ isa
  validate
  type_of }               = require './types'


#-----------------------------------------------------------------------------------------------------------
@$map   = ( method ) -> ( d, send ) => send method d
@$drain = ( on_end = null ) -> { [@marks.isa_sink], on_end, }
@$pass  = -> ( d, send ) => send d

#-----------------------------------------------------------------------------------------------------------
@$show = ( settings ) ->
  title = ( settings?.title ? '-->' ) + ' '
  return @$ ( d, send ) =>
    info title + jr d
    send d

#-----------------------------------------------------------------------------------------------------------
@$watch = ( settings, method ) ->
  switch arity = arguments.length
    when 1
      method = settings
      return @$ ( d, send ) => method d; send d
    #.......................................................................................................
    when 2
      return @$watch method unless settings?
      ### If any `surround` feature is called for, wrap all surround values so that we can safely
      distinguish between them and ordinary stream values; this is necessary to prevent them from leaking
      into the regular stream outside the `$watch` transform: ###
      take_second     = Symbol 'take-second'
      settings        = assign {}, settings
      settings[ key ] = [ take_second, value, ] for key, value of settings
      #.....................................................................................................
      return @$ settings, ( d, send ) =>
        if ( CND.isa_list d ) and ( d[ 0 ] is take_second )
          method d[ 1 ]
        else
          method d
          send d
        return null
  #.........................................................................................................
  throw new Error "µ18244 expected one or two arguments, got #{arity}"

#-----------------------------------------------------------------------------------------------------------
@$as_text = ( settings ) -> ( d, send ) =>
  serialize = settings?[ 'serialize' ] ? JSON.stringify
  return @$map ( data ) => serialize data

#-----------------------------------------------------------------------------------------------------------
@$collect = ( settings ) ->
  collector = settings?.collector ? []
  last      = Symbol 'last'
  return @$ { last, }, ( d, send ) =>
    if d is last then return send collector
    collector.push d
    return null

