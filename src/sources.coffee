

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/SOURCES'
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
@new_value_source = ( x ) -> yield from x

#-----------------------------------------------------------------------------------------------------------
@new_push_source = ->
  send = ( d ) =>
    return R.buffer.push d unless R.duct?
    R.buffer = null
    return end() if d is @signals.end
    R.duct.mem_source.push d
    R.duct.exhaust_pipeline()
    return null
  end = =>
    R.duct.mem_source.push @signals.last
    R.duct.exhaust_pipeline()
    R.duct.last.on_end() if R.duct.last.on_end?
    return R.duct = null
  R = { [@marks.isa_pusher], send, end, buffer: [], duct: null, }
  return R

