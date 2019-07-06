

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/MAIN'
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
PD                        = require 'pipedreams11'
types                     = require '../types'
{ isa
  validate
  declare
  first_of
  last_of
  size_of
  type_of }               = types


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@symbols =
  sink:       Symbol 'sink'       # Marks a sink (only used by `$drain()`)
  last:       Symbol 'last'       # May be used to signal last  data item
  first:      Symbol 'first'      # May be used to signal first data item
  end:        Symbol 'end'        # Request stream to terminate
  misfit:     Symbol 'misfit'     # Bottom value
  send_last:  Symbol 'send_last'  # Request to get called once more after has ended

#-----------------------------------------------------------------------------------------------------------
remit_defaults  =
  first:    @symbols.misfit
  last:     @symbols.misfit
  between:  @symbols.misfit
  after:    @symbols.misfit
  before:   @symbols.misfit


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@_get_remit_settings = ( settings, method ) ->
  switch remit_arity = arguments.length
    when 1 then [ method, settings, ] = [ settings, null, ]
    when 2 then settings = { remit_defaults..., settings..., }
    else throw new Error "µ19358 expected 1 or 2 arguments, got #{remit_arity}"
  #.........................................................................................................
  validate.function method
  throw new Error "µ20123 method arity #{arity} not implemented" unless ( arity = method.length ) is 2
  if settings?
    validate.function settings.leapfrog if settings.leapfrog?
    settings._surround = \
      ( settings.first    isnt @symbols.misfit ) or \
      ( settings.last     isnt @symbols.misfit ) or \
      ( settings.between  isnt @symbols.misfit ) or \
      ( settings.after    isnt @symbols.misfit ) or \
      ( settings.before   isnt @symbols.misfit )
  #.........................................................................................................
  return { settings, method, }

#-----------------------------------------------------------------------------------------------------------
@remit  = @$ = ( P... ) =>
  { settings, method, } = @_get_remit_settings P...
  return method if settings is null
  self                  = null
  do_leapfrog           = settings.leapfrog
  data_first            = settings.first
  data_before           = settings.before
  data_between          = settings.between
  data_after            = settings.after
  data_last             = settings.last
  send_first            = data_first    isnt @symbols.misfit
  send_before           = data_before   isnt @symbols.misfit
  send_between          = data_between  isnt @symbols.misfit
  send_after            = data_after    isnt @symbols.misfit
  send_last             = data_last     isnt @symbols.misfit
  on_end                = null
  is_first              = true
  ME                    = @
  has_returned          = false
  send                  = null
  #.........................................................................................................
  # on_end = ->
  #   if send_last
  #     self = @
  #     method data_last, send
  #     self = null
  #   # defer -> @queue ME.symbols.end
  #   @queue ME.symbols.end
  #   return null
  #.........................................................................................................
  tsend = ( d ) =>
    throw new Error "µ55663 illegal to call send() after method has returned" if has_returned
    send d
  #.........................................................................................................
  R = ( d, send_ ) =>
    # debug 'µ55641', d, d is @symbols.last
    send          = send_
    has_returned  = false
    #.......................................................................................................
    if send_last and d is @symbols.last
      method data_last, tsend
    #.......................................................................................................
    else
      if is_first then ( ( method data_first,   tsend ) if send_first   )
      else             ( ( method data_between, tsend ) if send_between )
      ( method data_before, tsend ) if send_before
      is_first = false
      #.....................................................................................................
      # When leapfrogging is being called for, only call method if the jumper returns false:
      if ( not do_leapfrog ) or ( not settings.leapfrog d ) then  method d, tsend
      else                                                        send d
      #.....................................................................................................
      ( method data_after, tsend ) if send_after
    has_returned = true
    return null
  #.........................................................................................................
  R[ @symbols.send_last ] = true if send_last
  return R


#-----------------------------------------------------------------------------------------------------------
@$map   = ( method ) -> ( d, send ) => send method d
@$drain = ( on_end = null ) -> { [@symbols.sink], on_end, }
@$pass  = -> ( d, send ) => send d

#-----------------------------------------------------------------------------------------------------------
@$show = ( settings ) ->
  title = ( settings?.title ? '-->' ) + ' '
  return @$ ( d, send ) =>
    info title + jr d
    send d

# #-----------------------------------------------------------------------------------------------------------
# @$xs = ( method ) -> ( d, send ) =>
#   if ( d.$stamped ? false ) then return send d
#   method d, send

#-----------------------------------------------------------------------------------------------------------
@$watch = -> ( method ) => @$ ( d, send ) => method d; send d

#-----------------------------------------------------------------------------------------------------------
@$as_text = ( settings ) -> ( d, send ) =>
  serialize = settings?[ 'serialize' ] ? JSON.stringify
  return @$map ( data ) => serialize data

#-----------------------------------------------------------------------------------------------------------
@_classify_transform = ( transform ) ->
  return { type: 'source', } if transform[ Symbol.iterator ]?
  switch type = type_of transform
    when 'function'           then return { type: 'through', }
    when 'generatorfunction'  then return { type: 'source', must_call: true, }
  return { type: 'sink', on_end: transform.on_end, } if transform[ @symbols.sink ]?
  throw new Error "µ44521 expected an iterable, a function, a generator function or a sink, got a #{type}"

#-----------------------------------------------------------------------------------------------------------
@_classify_pipeline = ( transforms ) ->
  ### TAINT test for, complain about illegal combinations of sources, sinks ###
  return { empty: true, } if transforms.length is 0
  R       = { length: transforms.length, }
  R.first = @_classify_transform first_of transforms
  R.last  = @_classify_transform last_of  transforms
  return R

#-----------------------------------------------------------------------------------------------------------
@pull = ( transforms... ) ->
  # transforms      = transforms.flat Infinity
  description     = @_classify_pipeline transforms
  has_sink        = false
  has_source      = false
  on_end          = null
  original_source = null
  throw new Error "µ77764 source as last transform not yet supported" if description.last.type  is 'source'
  throw new Error "µ77765 sink as first transform not yet supported"  if description.first.type is 'sink'
  #.........................................................................................................
  if description.first.type is 'source'
    original_source = transforms.shift()
    original_source = original_source() if description.first.must_call
    has_source      = true
  #.........................................................................................................
  if description.last.type is 'sink'
    has_sink  = true
    on_end    = description.last.on_end
    transforms.pop()
  #.........................................................................................................
  ### TAINT shouldn't return null here; return pipeline? ###
  return null unless has_sink and has_source
  #.........................................................................................................
  mem_source      = []
  mem_sources     = [ mem_source, ( [] for _ in [ 0 ... transforms.length ] )..., ]
  local_sink      = null
  local_source    = null
  send            = ( d ) -> local_sink.push d
  #.........................................................................................................
  for d from original_source
    mem_source.push d
    #.......................................................................................................
    loop
      has_data = false
      for transform, idx in transforms
        continue if ( local_source = mem_sources[ idx ] ).length is 0
        has_data      = true
        local_sink    = mem_sources[ idx + 1 ]
        d             = local_source.shift()
        transform d, send
      break unless has_data
  #.........................................................................................................
  # warn "µ77768 stream has ended; should call transforms as appropriate"
  on_end() if on_end?
  return null


#===========================================================================================================
# SOURCES
#-----------------------------------------------------------------------------------------------------------
@new_value_source = ( x ) -> yield from x



############################################################################################################
unless module.parent?
  do =>
    PS        = require 'pipestreams'
    PDNG      = @
    ps_names  = ( ps_name for ps_name of PS ).sort()
    hits      = 0
    for ps_name in ps_names
      continue if ps_name.startsWith '_'
      if PDNG[ ps_name ]?
        hits++
        pdng_color = CND.green
      else
        pdng_color = CND.red
      ps_name_txt = to_width ps_name, 40, { padder: ' ', align: 'left', }
      echo ( CND.green ps_name_txt ), ( pdng_color ps_name_txt )
    nf          = require 'number-format.js'
    percentage  = nf '##0.0', ( hits / ps_names.length ) * 100
    echo "implemented #{percentage}%"


