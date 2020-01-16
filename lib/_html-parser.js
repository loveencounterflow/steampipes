(function() {
  'use strict';
  var CND, DATOM, HtmlParser, Htmlparser, L, Multimix, alert, badge, cast, debug, echo, help, info, isa, last_of, log, new_datom, rpr, select, type_of, types, urge, validate, warn, whisper, wrap_datom;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/HTML-PARSER';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  types = require('./types');

  ({isa, validate, cast, last_of, type_of} = types);

  // SP                        = require '..'
  // { $
  //   $async
  //   $drain
  //   $watch
  //   $show  }                = SP.export()
  //...........................................................................................................
  DATOM = new (require('datom')).Datom({
    dirty: false
  });

  // lets
  ({new_datom, wrap_datom, select} = DATOM.export());

  //...........................................................................................................
  Multimix = require('multimix');

  HtmlParser = require('atlas-html-stream');

  L = this;

  //-----------------------------------------------------------------------------------------------------------
  this.new_onepiece_parser = function() {
    return this._new_parse_method(false);
  };

  this.new_piecemeal_parser = function() {
    return this._new_parse_method(true);
  };

  //-----------------------------------------------------------------------------------------------------------
  this._new_parse_method = function(piecemeal) {
    var R, parser;
    R = null;
    parser = new HtmlParser({
      preserveWS: true
    });
    //.........................................................................................................
    parser.on('data', ({name, data, text}) => {
      var has_keys, key, value;
      if (text != null) {
        return R.push(new_datom('^text', {text}));
      }
      if (data == null) {
        return R.push(new_datom('>' + name));
      }
      has_keys = false;
      for (key in data) {
        value = data[key];
        has_keys = true;
        if (value === '') {
          data[key] = true;
        }
      }
      if (!has_keys) {
        return R.push(new_datom('<' + name));
      }
      return R.push(new_datom('<' + name, {data}));
    });
    parser.on('error', function(error) {
      throw error;
    });
    // parser.on 'end', -> R.push new_datom '^stop'
    //.........................................................................................................
    R = (html) => {
      R = [];
      parser.write(html);
      if (!piecemeal) {
        parser.flushText();
        parser.reset();
      }
      return R;
    };
    //.........................................................................................................
    R.flush = function() {
      return parser.flushText();
    };
    R.reset = function() {
      return parser.reset();
    };
    return R;
  };

  Htmlparser = (function() {
    //-----------------------------------------------------------------------------------------------------------
    class Htmlparser extends Multimix {
      //---------------------------------------------------------------------------------------------------------
      constructor(settings = null) {
        super();
        this.settings = settings;
      }

    };

    // @extend   object_with_class_properties
    Htmlparser.include(L);

    return Htmlparser;

  }).call(this);

  // @specs    = {}
  // @isa      = Multimix.get_keymethod_proxy @, isa
  // # @validate = Multimix.get_keymethod_proxy @, validate
  // declarations.declare_types.apply @

  //###########################################################################################################
  module.exports = new Htmlparser();

}).call(this);
