(function() {
  'use strict';
  var CND, FS, L, Multimix, Steampipes, badge, debug, echo, help, info, isa, jr, rpr, type_of, urge, validate, warn, whisper;

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

  FS = require('fs');

  Steampipes = (function() {
    //-----------------------------------------------------------------------------------------------------------
    class Steampipes extends Multimix {
      //---------------------------------------------------------------------------------------------------------
      constructor(settings = null) {
        super();
        this.settings = settings;
      }

    };

    Steampipes.include(require('./modify'));

    Steampipes.include(require('./njs-streams-and-files'));

    Steampipes.include(require('./pipestreams-adapter'));

    Steampipes.include(require('./pull-remit'));

    Steampipes.include(require('./sort'));

    Steampipes.include(require('./sources'));

    Steampipes.include(require('./standard-transforms'));

    Steampipes.include(require('./text'));

    return Steampipes;

  }).call(this);

  //###########################################################################################################
  module.exports = L = new Steampipes();

  L.Steampipes = Steampipes;

}).call(this);
