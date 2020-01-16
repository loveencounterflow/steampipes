

'use strict'


############################################################################################################
CND                       = require 'cnd'
rpr                       = CND.rpr
badge                     = 'STEAMPIPES/BASICS'
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
info                      = CND.get_logger 'info',      badge
urge                      = CND.get_logger 'urge',      badge
help                      = CND.get_logger 'help',      badge
whisper                   = CND.get_logger 'whisper',   badge
echo                      = CND.echo.bind CND
#...........................................................................................................
{ jr }                    = CND
#...........................................................................................................
@types                    = require './types'
{ isa
  validate
  type_of }               = @types
Multimix                  = require 'multimix'
FS                        = require 'fs'

#-----------------------------------------------------------------------------------------------------------
class Steampipes extends Multimix
  # @extend   object_with_class_properties
  filenames = FS.readdirSync __dirname
  for filename in filenames
    continue unless filename.endsWith '.js'
    continue if filename.startsWith '_'
    continue if filename is 'main.js'
    continue if filename is 'types.js'
    path = './' + filename
    @include require path

  #---------------------------------------------------------------------------------------------------------
  constructor: ( @settings = null ) ->
    super()
    @HTML = require './_html-parser'
    # @specs    = {}
    # @isa      = Multimix.get_keymethod_proxy @, isa
    # # @validate = Multimix.get_keymethod_proxy @, validate
    # declarations.declare_types.apply @

############################################################################################################
module.exports 	= L = new Steampipes()
L.Steampipes 		= Steampipes


