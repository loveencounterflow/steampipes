(function() {
  'use strict';
  var CND, L, Multimix, badge, debug, echo, help, info, isa, jr, rpr, type_of, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/BASICS';

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  info = CND.get_logger('info', badge);

  urge = CND.get_logger('urge', badge);

  help = CND.get_logger('help', badge);

  whisper = CND.get_logger('whisper', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  ({jr} = CND);

  //...........................................................................................................
  this.types = require('./types');

  ({isa, validate, type_of} = this.types);

  Multimix = require('multimix');

  //-----------------------------------------------------------------------------------------------------------
  this.Steampipes = (function() {
    class Steampipes extends Multimix {
      //---------------------------------------------------------------------------------------------------------
      constructor(settings = null) {
        super();
        this.settings = settings;
      }

    };

    // @extend   object_with_class_properties
    Steampipes.include(require('./pull-remit'));

    Steampipes.include(require('./standard-transforms'));

    Steampipes.include(require('./sources'));

    Steampipes.include(require('./windowing'));

    return Steampipes;

  }).call(this);

  // @specs    = {}
  // @isa      = Multimix.get_keymethod_proxy @, isa
  // # @validate = Multimix.get_keymethod_proxy @, validate
  // declarations.declare_types.apply @

  //###########################################################################################################
  module.exports = L = new this.Steampipes();

  (function() {
    var key, value;
    for (key in L) {
      value = L[key];
      if (isa.function(value)) {
        L[key] = value.bind(L);
      }
    }
    return null;
  })();

}).call(this);
