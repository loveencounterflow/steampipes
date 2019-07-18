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
    var filename, filenames, i, len, path;

    //-----------------------------------------------------------------------------------------------------------
    class Steampipes extends Multimix {
      //---------------------------------------------------------------------------------------------------------
      constructor(settings = null) {
        super();
        this.settings = settings;
      }

    };

    // @extend   object_with_class_properties
    filenames = FS.readdirSync(__dirname);

    for (i = 0, len = filenames.length; i < len; i++) {
      filename = filenames[i];
      if (!filename.endsWith('.js')) {
        continue;
      }
      if (filename.startsWith('_')) {
        continue;
      }
      if (filename === 'main.js') {
        continue;
      }
      if (filename === 'types.js') {
        continue;
      }
      path = './' + filename;
      Steampipes.include(require(path));
    }

    return Steampipes;

  }).call(this);

  // @specs    = {}
  // @isa      = Multimix.get_keymethod_proxy @, isa
  // # @validate = Multimix.get_keymethod_proxy @, validate
  // declarations.declare_types.apply @

  //###########################################################################################################
  module.exports = L = new Steampipes();

  L.Steampipes = Steampipes;

}).call(this);
