

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
types                     = require './_types'
{ isa
  validate
  declare
  first_of
  last_of
  size_of
  type_of }               = types
misfit                    = Symbol 'misfit'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
### Signals are special values that, when sent down the pipeline, may alter behavior: ###
@signals =
  last:             Symbol 'last'             # Used to signal last data item
  end:              Symbol 'end'              # Request stream to terminate

#-----------------------------------------------------------------------------------------------------------
### Marks are special values that identify types, behavior of pipeline elements etc: ###
@marks =
  isa_sink:         Symbol 'isa_sink'         # Marks a sink as such
  isa_duct:         Symbol 'isa_duct'         # Marks a duct as such
  isa_pusher:       Symbol 'isa_pusher'       # Marks a push source as such
  send_last:        Symbol 'send_last'        # Marks transforms expecting a certain value before EOS

#-----------------------------------------------------------------------------------------------------------
remit_defaults  =
  first:    misfit
  last:     misfit
  between:  misfit
  after:    misfit
  before:   misfit


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
      ( settings.first    isnt misfit ) or \
      ( settings.last     isnt misfit ) or \
      ( settings.between  isnt misfit ) or \
      ( settings.after    isnt misfit ) or \
      ( settings.before   isnt misfit )
  #.........................................................................................................
  return { settings, method, }

#-----------------------------------------------------------------------------------------------------------
@remit  = @$ = ( P... ) =>
  { settings, method, } = @_get_remit_settings P...
  has_returned          = false
  send                  = null
  #.........................................................................................................
  tsend = ( d ) =>
    throw new Error "µ55663 illegal to call send() after method has returned" if has_returned
    send d
  tsend.end = -> send.end()
  #.........................................................................................................
  unless settings?
    ### fast track without surround features ###
    return ( d, send_ ) =>
      send          = send_
      has_returned  = false
      method d, tsend
      has_returned = true
      return null
  #.........................................................................................................
  self                  = null
  do_leapfrog           = settings.leapfrog
  data_first            = settings.first
  data_before           = settings.before
  data_between          = settings.between
  data_after            = settings.after
  data_last             = settings.last
  send_first            = data_first    isnt misfit
  send_before           = data_before   isnt misfit
  send_between          = data_between  isnt misfit
  send_after            = data_after    isnt misfit
  send_last             = data_last     isnt misfit
  on_end                = null
  is_first              = true
  ME                    = @
  #.........................................................................................................
  ### slow track with surround features ###
  R = ( d, send_ ) =>
    # debug 'µ55641', d, d is @signals.last
    send          = send_
    has_returned  = false
    #.......................................................................................................
    if send_last and d is @signals.last
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
  R[ @marks.send_last ] = @marks.send_last if send_last
  return R


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

# #-----------------------------------------------------------------------------------------------------------
# @$xs = ( method ) -> ( d, send ) =>
#   if ( d.$stamped ? false ) then return send d
#   method d, send

#-----------------------------------------------------------------------------------------------------------
$watch = ( settings, method ) ->
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
@$watch = $watch.bind @

#-----------------------------------------------------------------------------------------------------------
@$as_text = ( settings ) -> ( d, send ) =>
  serialize = settings?[ 'serialize' ] ? JSON.stringify
  return @$map ( data ) => serialize data

#-----------------------------------------------------------------------------------------------------------
@_classify_transform = ( transform ) ->
  return { type: 'source', subtype: is_push: true,  } if transform[ @marks.isa_pusher  ]?
  return { type: 'source',                          } if transform[ Symbol.iterator     ]?
  switch type = type_of transform
    when 'function'           then return { type: 'through', }
    when 'generatorfunction'  then return { type: 'source', must_call: true, }
  return { type: 'sink', on_end: transform.on_end, } if transform[ @marks.isa_sink ]?
  throw new Error "µ44521 expected an iterable, a function, a generator function or a sink, got a #{type}"

#-----------------------------------------------------------------------------------------------------------
@_classify_pipeline = ( transforms ) ->
  ### TAINT test for, complain about illegal combinations of sources, sinks ###
  return { empty: true, } if transforms.length is 0
  R       = { [@marks.isa_duct], length: transforms.length, transforms, }
  R.first = @_classify_transform first_of transforms
  R.last  = @_classify_transform last_of  transforms
  return R

#-----------------------------------------------------------------------------------------------------------
@_pull = ( transforms... ) ->
  duct            = @_classify_pipeline transforms
  has_sink        = false
  has_source      = false
  on_end          = null
  original_source = null
  # debug 'µ44433', duct
  throw new Error "µ77764 source as last transform not yet supported" if duct.last.type  is 'source'
  throw new Error "µ77765 sink as first transform not yet supported"  if duct.first.type is 'sink'
  #.........................................................................................................
  if duct.first.type is 'source'
    original_source = transforms.shift()
    original_source = original_source() if duct.first.must_call
    has_source      = true
  #.........................................................................................................
  if duct.last.type is 'sink'
    has_sink  = true
    on_end    = duct.last.on_end
    transforms.pop()
  #.........................................................................................................
  ### TAINT shouldn't return null here; return pipeline? ###
  return null unless has_sink and has_source
  #.........................................................................................................
  mem_source      = []
  mem_sources     = [ mem_source, ( [] for _ in [ 0 ... transforms.length ] )..., ]
  local_sink      = null
  local_source    = null
  last            = @signals.last
  #.........................................................................................................
  send = ( d ) =>
    return R.has_ended = true if d is @signals.end
    local_sink.push d
  send.end = => R.has_ended = true
  #.........................................................................................................
  exhaust_pipeline = =>
    loop
      has_data = false
      for transform, idx in transforms
        continue if ( local_source = mem_sources[ idx ] ).length is 0
        has_data      = true
        local_sink    = mem_sources[ idx + 1 ]
        d             = local_source.shift()
        if d is last
          transform d, send if transform[ @marks.send_last ]?
          send last
        else
          transform d, send
      break unless has_data
    return null
  #.........................................................................................................
  R = { mem_source, original_source, send, exhaust_pipeline, on_end, has_ended: false, }
  return R

#-----------------------------------------------------------------------------------------------------------
@pull = ( transforms... ) ->
  duct = @_pull transforms...
  return @_push duct if duct.original_source[ @marks.isa_pusher ]?
  #.........................................................................................................
  for d from duct.original_source
    break if duct.has_ended
    # continue if d is @signals.discard
    duct.mem_source.push d
    duct.exhaust_pipeline()
  #.........................................................................................................
  duct.mem_source.push @signals.last
  duct.exhaust_pipeline()
  duct.on_end() if duct.on_end?
  return null

#-----------------------------------------------------------------------------------------------------------
@_push = ( duct ) ->
  duct.original_source.duct = duct
  duct.mem_source.splice duct.mem_source.length, 0, duct.original_source.buffer...
  duct.exhaust_pipeline()
  return null


#===========================================================================================================
# SOURCES
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
    R.duct.on_end() if R.duct.on_end?
    return R.duct = null
  R = { [@marks.isa_pusher], send, end, buffer: [], duct: null, }
  return R


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@$collect = ( settings ) ->
  collector = settings?.collector ? []
  last      = Symbol 'last'
  return @$ { last, }, ( d, send ) =>
    if d is last then return send collector
    collector.push d
    return null




