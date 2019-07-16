

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/PULL-REMIT'
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
misfit                    = Symbol 'misfit'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
### Signals are special values that, when sent down the pipeline, may alter behavior: ###
@signals = Object.freeze
  last:             Symbol 'last'             # Used to signal last data item
  end:              Symbol 'end'              # Request stream to terminate

#-----------------------------------------------------------------------------------------------------------
### Marks are special values that identify types, behavior of pipeline elements etc: ###
@marks = Object.freeze
  steampipes:       Symbol 'steampipes'       # Marks steampipes objects
  validated:        Symbol 'validated'        # Marks a validated sink
  isa_duct:         Symbol 'isa_duct'         # Marks a duct as such
  isa_pusher:       Symbol 'isa_pusher'       # Marks a push source as such
  send_last:        Symbol 'send_last'        # Marks transforms expecting a certain value before EOS
  async:            Symbol 'async'            # Marks transforms as asynchronous (experimental)

#-----------------------------------------------------------------------------------------------------------
remit_defaults = Object.freeze
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
@$async = ( method ) ->
  throw new Error "µ77644 surround arguments not yet implemented" unless arguments.length is 1
  throw new Error "µ77644 method arity #{arity} not implemented" unless ( arity = method.length ) is 3
  resolve = null
  done    = ->
    throw new Error "µ82081 arguments not allowed" unless arguments.length is 0
    resolve()
  R = ( d, send ) => return new Promise ( resolve_ ) =>
    resolve = resolve_
    await method d, send, done
  R[ @marks.async ] = @marks.async
  return R

#-----------------------------------------------------------------------------------------------------------
@_classify_sink = ( transform ) ->
  @_$drain transform unless transform[ @marks.validated ]?
  R = { type: 'sink', }

#-----------------------------------------------------------------------------------------------------------
@_classify_transform = ( transform ) ->
  R = do =>
    return { type: transform.type,              } if transform[ @marks.isa_duct   ]?
    return { type: 'source', isa_pusher: true,  } if transform[ @marks.isa_pusher ]?
    return { type: 'source',                    } if transform[ Symbol.iterator   ]?
    return @_classify_sink transform              if ( isa.object transform ) and transform.sink?
    switch type = type_of transform
      when 'function'           then return { type: 'through', }
      when 'generatorfunction'  then return { type: 'source', must_call: true, }
    throw new Error "µ44521 expected an iterable, a function, a generator function or a sink, got a #{type}"
  R.mode = if transform[ @marks.async ]? then 'async' else 'sync'
  return R

#-----------------------------------------------------------------------------------------------------------
@_flatten_transforms = ( transforms, R = null ) ->
  R ?= []
  for transform in transforms
    if transform[ @marks.isa_duct ]?
      ### TAINT necessary to do this recursively? ###
      R.push t for t in transform.transforms
    else
      R.push transform
  return R

#-----------------------------------------------------------------------------------------------------------
@_new_duct = ( transforms ) ->
  transforms  = @_flatten_transforms transforms
  blurbs      = ( @_classify_transform transform for transform in transforms )
  R           = { [@marks.steampipes], [@marks.isa_duct], transforms, blurbs, }
  R.mode      = if ( blurbs.some ( blurb ) -> blurb.mode is 'async' ) then 'async' else 'sync'
  if transforms.length is 0
    R.is_empty = true
    return R
  #.........................................................................................................
  R.first = blurbs[ 0 ]
  if transforms.length is 1
    R.is_single   = true
    R.last        = R.first
    R.type        = R.first.type
  else
    R.last        = blurbs[ transforms.length - 1 ]
    switch key = "#{R.first.type}/#{R.last.type}"
      when 'source/through'   then R.type = 'source'
      when 'through/sink'     then R.type = 'sink'
      when 'through/through'  then R.type = 'through'
      when 'source/sink'      then R.type = 'circuit'
      else throw new Error "µ44521 illegal duct configuration #{rpr key}"
    for idx in [ 1 ... blurbs.length - 1 ] by +1
      unless ( b = blurbs[ idx ] ).type is 'through'
        throw new Error "µ44522 illegal duct configuration at transform index #{idx}: #{rpr b}"
  return R

#-----------------------------------------------------------------------------------------------------------
@_pull = ( transforms... ) ->
  duct                  = @_new_duct transforms
  { transforms, }       = duct
  original_source       = null
  throw new Error "µ77764 source as last transform not yet supported" if duct.last.type  is 'source'
  throw new Error "µ77765 sink as first transform not yet supported"  if duct.first.type is 'sink'
  #.........................................................................................................
  if duct.first.type is 'source'
    transforms[ 0 ] = transforms[ 0 ]() if duct.first.must_call
    source          = transforms[ 0 ]
  #.........................................................................................................
  return duct unless duct.type is 'circuit'
  #.........................................................................................................
  drain                 = transforms[ transforms.length - 1 ]
  duct.buckets          = buckets     = ( [] for _ in [ 1 ... transforms.length - 1 ] )
  duct.buckets.push drain.sink if drain.use_sink
  duct.has_ended        = false
  local_sink            = null
  local_source          = null
  has_local_sink        = null
  last                  = @signals.last
  last_transform_idx    = buckets.length - if drain.use_sink then 2 else 1
  tf_idxs               = [ 0 .. last_transform_idx ]
  #.........................................................................................................
  send = ( d ) =>
    return duct.has_ended = true if d is @signals.end
    local_sink.push d if has_local_sink
    return null
  send.end = => duct.has_ended = true
  #.........................................................................................................
  exhaust_pipeline = =>
    loop
      data_count    = 0
      # for transform, idx in transforms
      for idx in tf_idxs
        continue if ( local_source = buckets[ idx ] ).length is 0
        transform       = transforms[  idx + 1 ]
        local_sink      = buckets[ idx + 1 ]
        has_local_sink  = local_sink?
        d               = local_source.shift()
        data_count     += local_source.length
        if d is last
          transform d, send if transform[ @marks.send_last ]?
          send last unless idx is last_transform_idx
        else
          transform d, send
      break if data_count is 0
    return null
  #.........................................................................................................
  exhaust_async_pipeline = =>
    loop
      data_count    = 0
      # for transform, idx in transforms
      for idx in tf_idxs
        continue if ( local_source = buckets[ idx ] ).length is 0
        transform       = transforms[  idx + 1 ]
        local_sink      = buckets[ idx + 1 ]
        has_local_sink  = local_sink?
        d               = local_source.shift()
        data_count     += local_source.length
        if d is last
          await transform d, send if transform[ @marks.send_last ]?
          send last unless idx is last_transform_idx
        else
          await transform d, send
      break if data_count is 0
    return null
  #.........................................................................................................
  duct.send                   = send
  duct.exhaust_pipeline       = exhaust_pipeline
  duct.exhaust_async_pipeline = exhaust_async_pipeline
  #.........................................................................................................
  return duct

#-----------------------------------------------------------------------------------------------------------
@pull = ( transforms... ) ->
  duct = @_pull transforms...
  if duct.mode is 'async'
    throw new Error "µ88872 pipeline contains asynchronous transform; use `pull_async pipeline...`"
  return duct unless duct.type is 'circuit'
  return @_push duct if duct.transforms[ 0 ][ @marks.isa_pusher ]?
  first_bucket = duct.buckets[ 0 ]
  #.........................................................................................................
  for d from duct.transforms[ 0 ]
    break if duct.has_ended
    # continue if d is @signals.discard
    first_bucket.push d
    duct.exhaust_pipeline()
  #.........................................................................................................
  first_bucket.push @signals.last
  duct.exhaust_pipeline()
  drain = transforms[ transforms.length - 1 ]
  if ( on_end = drain.on_end )?
    if drain.call_with_datoms then drain.on_end drain.sink else drain.on_end()
  return duct

#-----------------------------------------------------------------------------------------------------------
@pull_async = ( transforms... ) ->
  duct = @_pull transforms...
  return duct unless duct.type is 'circuit'
  return @_push duct if duct.transforms[ 0 ][ @marks.isa_pusher ]?
  first_bucket = duct.buckets[ 0 ]
  #.........................................................................................................
  for d from duct.transforms[ 0 ]
    break if duct.has_ended
    # continue if d is @signals.discard
    first_bucket.push d
    await duct.exhaust_async_pipeline()
  #.........................................................................................................
  first_bucket.push @signals.last
  await duct.exhaust_async_pipeline()
  drain = transforms[ transforms.length - 1 ]
  if ( on_end = drain.on_end )?
    if drain.call_with_datoms then drain.on_end drain.sink else drain.on_end()
  return duct

#-----------------------------------------------------------------------------------------------------------
@_push = ( duct ) ->
  ### Make `duct` available from the POV of the push source: ###
  source        = duct.transforms[ 0 ]
  source.duct   = duct
  ### copy buffered data (from before when `pull()` was called) to `source`: ###
  first_bucket  = duct.buckets[ 0 ]
  first_bucket.splice first_bucket.length, 0, source.buffer...
  ### Process any data as may have accumulated at this point: ###
  duct.exhaust_pipeline()
  return null


