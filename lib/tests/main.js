(function() {
  //###########################################################################################################
  var CND, FS, L, OS, PATH, alert, badge, debug, echo, glob, help, info, log, rpr, test, urge, warn, whisper;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/TEE';

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
  PATH = require('path');

  FS = require('fs');

  OS = require('os');

  test = require('guy-test');

  glob = require('globby');

  //###########################################################################################################
  L = this;

  (function() {
    var i, key, len, module, path, paths, value;
    paths = glob.sync(PATH.join(__dirname, '*.test.js'));
    for (i = 0, len = paths.length; i < len; i++) {
      path = paths[i];
      // debug '39838', path
      module = require(path);
      for (key in module) {
        value = module[key];
        if (key.startsWith('_')) {
          continue;
        }
        debug('39838', path, key);
        if (L[key] != null) {
          throw new Error(`duplicate key ${rpr(key)}`);
        }
        L[key] = value.bind(L);
      }
    }
    test(L, {
      timeout: 5000
    });
    return help("tested:");
  })();

}).call(this);
