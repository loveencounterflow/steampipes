(function() {
  'use strict';
  var CND, DATOM, HtmlParser, alert, badge, cast, debug, echo, help, info, isa, last_of, log, new_datom, rpr, select, type_of, types, urge, validate, warn, whisper, wrap_datom;

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

  // SP                        = require './main'
  // debug SP
  // { $
  //   $async
  //   $watch
  //   $show
  //   $drain }                = SP.export()
  //...........................................................................................................
  DATOM = new (require('datom')).Datom({
    dirty: false
  });

  // lets
  ({new_datom, wrap_datom, select} = DATOM.export());

  //...........................................................................................................
  HtmlParser = require('atlas-html-stream');

  /* NOTE

  below are first steps to build an MKTS-compatible HTML parser from scratch; this will probably not be
  continued because [`atlas-html-stream`](https://github.com/atlassubbed/atlas-html-stream) looks like a good
  solution (except we still have too look for opening tags since some MKTS tags can use their own content
  parsers).

  #-----------------------------------------------------------------------------------------------------------
  attributes_pattern        = /\b([a-z][a-z0-9\-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/ig;

  #-----------------------------------------------------------------------------------------------------------
  @parse_attributes = ( attributes ) ->
   * thx to https://github.com/taoqf/node-html-parser/blob/master/src/index.ts#L497
    R = {}
    return R if ( attributes.length is 0 )
   * attributes_pattern.
    debug attributes_pattern.lastIndex
    while ( match = attributes_pattern.exec attributes )?
      debug attributes_pattern.lastIndex
      R[ match[ 1 ] ] = match[ 2 ] ? match[ 3 ] ? match[ 4 ] ? true
    return R

  #-----------------------------------------------------------------------------------------------------------
  @parse_tag = ( tag ) ->

   */
  //-----------------------------------------------------------------------------------------------------------
  this.new_parse_method = function() {
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
    return (html) => {
      R = [];
      parser.write(html);
      parser.reset();
      return R;
    };
  };

}).call(this);
