

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
@$map   = ( method ) -> @$ ( d, send ) -> send method d
@$pass  = -> @$ ( d, send ) -> send d

#-----------------------------------------------------------------------------------------------------------
@$drain = ( settings = null, on_end = null ) ->
  switch ( arity = arguments.length )
    when 0 then null
    when 2 then null
    when 1
      if isa.function settings
        [ settings, on_end, ] = [ null, settings, ]
    else throw new Error "expected 0 to 2 arguments, got #{arity}"
  settings ?= {}
  settings.on_end = on_end if on_end?
  return @_$drain settings

#-----------------------------------------------------------------------------------------------------------
@_$drain = ( settings ) ->
  sink      = settings?.sink ? true
  if ( on_end = settings.on_end )?
    validate.function on_end
    switch ( arity = on_end.length )
      when 0 then null
      when 1
        sink = [] if sink is true
      else throw new Error "expected 0 to 1 arguments, got #{arity}"
  use_sink          = sink? and ( sink isnt true )
  call_with_datoms  = on_end? and on_end.length is 1
  R                 = { [@marks.validated], sink, on_end, call_with_datoms, use_sink, }
  R.on_end          = on_end if on_end?
  return R

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
@$filter = ( filter ) ->
  unless ( type = CND.type_of filter ) is 'function'
    throw new Error "^steampipes/$filter@5663^ expected a function, got a #{type}"
  return @$ ( data, send ) => if ( filter data ) then send data

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

#-----------------------------------------------------------------------------------------------------------
### Given a `settings` object, add values to the stream as `$ settings, ( d, send ) -> send d` would do,
e.g. `$surround { first: 'first!', between: 'to appear in-between two values', }`. ###
@$surround = ( settings ) -> @$ settings, ( d, send ) => send d

#-----------------------------------------------------------------------------------------------------------
@leapfrog = ( jumper, transform ) -> @$ { leapfrog: jumper, }, transform

#-----------------------------------------------------------------------------------------------------------
@$once_before_first = ( transform ) ->
  ### Call transform once before any data item comes down the stream (if any). Transform must only accept
  a single `send` argument and can send as many data items down the stream which will be prepended
  to those items coming from upstream. ###
  unless ( arity = transform.length ) is 1
    throw new Error "^steampipes/pullremit@7033^ transform arity #{arity} not implemented"
  sink  = []
  first = Symbol 'first'
  return @$ { first, }, ( d, send ) =>
    return send d unless d is first
    ### TAINT missing `send.end()` method ###
    transform sink.push.bind sink
    send d_ for d_ in sink
    return null

#-----------------------------------------------------------------------------------------------------------
@$once_with_first = ( transform ) ->
  ### Call transform once with the first data item (if any). ###
  is_first = true
  return @$ ( d, send ) =>
    return send d unless is_first
    is_first = false
    transform d, send
    return null

#-----------------------------------------------------------------------------------------------------------
@$once_after_last = ( transform ) ->
  ### Call transform once after any data item comes down the stream (if any). Transform must only accept
  a single `send` argument and can send as many data items down the stream which will be appended
  to those items coming from upstream. ###
  unless ( arity = transform.length ) is 1
    throw new Error "^steampipes/pullremit@7033^ transform arity #{arity} not implemented"
  sink  = []
  last  = Symbol 'last'
  return @$ { last, }, ( d, send ) =>
    return send d unless d is last
    ### TAINT missing `send.end()` method ###
    transform sink.push.bind sink
    send d_ for d_ in sink
    return null

#-----------------------------------------------------------------------------------------------------------
@$once_async_before_first = ( transform ) ->
  ### Call transform once before any data item comes down the stream (if any). Transform must only accept
  a single `send` argument and can send as many data items down the stream which will be prepended
  to those items coming from upstream. ###
  unless ( arity = transform.length ) is 2
    throw new Error "^steampipes/pullremit@7033^ transform arity #{arity} not implemented"
  sink      = []
  pipeline  = []
  first     = Symbol 'first'
  pipeline.push @$ { first, }, ( d, send ) => send d
  pipeline.push @$async ( d, send, done ) =>
    unless d is first
      send d
      return done()
    ### TAINT missing `send.end()` method ###
    await transform ( sink.push.bind sink ), =>
      send d_ for d_ in sink
      done()
    return null
  return @pull pipeline...

#-----------------------------------------------------------------------------------------------------------
@$once_async_after_last = ( transform ) ->
  ### Call transform once before any data item comes down the stream (if any). Transform must only accept
  a single `send` argument and can send as many data items down the stream which will be prepended
  to those items coming from upstream. ###
  unless ( arity = transform.length ) is 2
    throw new Error "^steampipes/pullremit@7034^ transform arity #{arity} not implemented"
  sink      = []
  pipeline  = []
  last      = Symbol 'last'
  pipeline.push @$ { last, }, ( d, send ) => send d
  pipeline.push @$async ( d, send, done ) =>
    unless d is last
      send d
      return done()
    ### TAINT missing `send.end()` method ###
    await transform ( sink.push.bind sink ), =>
      send d_ for d_ in sink
      done()
    return null
  return @pull pipeline...

#-----------------------------------------------------------------------------------------------------------
@$tee = ( bystream ) ->
  source    = @new_push_source()
  last      = Symbol 'last'
  pipeline  = []
  pipeline.push source
  pipeline.push bystream
  @pull pipeline...
  return $ { last, }, ( d, send ) =>
    return source.end() if d is last
    source.send d
    send d





