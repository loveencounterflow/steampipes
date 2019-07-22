(function() {
  'use strict';
  var $, $async, $show, $watch, CND, FS, OS, PATH, SP, alert, badge, debug, defer, demo, echo, help, info, isa, jr, log, rpr, test, text, type_of, types, urge, validate, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/EXPERIMENTS/DEMO-REFORMAT-FILE';

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

  ({jr} = CND);

  //...........................................................................................................
  SP = require('../..');

  ({$, $async, $watch, $show} = SP.export());

  defer = setImmediate;

  types = require('../types');

  ({isa, validate, type_of} = types);

  text = '';

  text += '[["白金ごるふ場","しろがねごるふじょう","白金ゴルフ場 [しろがねゴルフじょう] /Shirogane golf links (p)/"],';

  text += '["白金だむ","しろがねだむ","白金ダム [しろがねダム] /Shirogane dam (p)/"],';

  text += '["白金郁夫","しらかねいくお","Shirakane Ikuo (h)"],';

  text += '["白金温泉","しろがねおんせん","Shiroganeonsen (p)"],';

  text += '["白金橋","しろがねばし","Shiroganebashi (p)"],';

  text += '["白金原","しらかねばる","Shirakanebaru (p)"],';

  text += '["白金高輪駅","しろかねたかなわえき","Shirokanetakanawa Station (st)"],';

  text += '["白金山","しらかねやま","Shirakaneyama (u)"],';

  text += '["白金川","しろがねがわ","Shiroganegawa (u)"],';

  text += '["奉輔","ともすけ","Tomosuke (u)"],';

  text += '["奉免","ほうめ","Houme (p)"],';

  text += '["奉免","ほうめん","Houmen (p)"],';

  text += '["奉免町","ほうめんまち","Houmenmachi (p)"],';

  text += '["奉雄","ともお","Tomoo (g)"],';

  text += '["奉養","ほうよう","Houyou (s)"],';

  text += '["奉廣","ともひろ","Tomohiro (g)"],';

  text += '["奉鉉","ほうげん","Hougen (g)"],';

  text += '["宝","たから","Takara (s,m,f)"],';

  text += '["宝","たからさき","Takarasaki (s)"],';

  text += '["宝","とみ","Tomi (s)"],';

  text += '["宝","ひじり","Hijiri (f)"],';

  text += '["宝","みち","Michi (f)"],';

  text += '["宝が丘","たからがおか","Takaragaoka (p)"],';

  text += '["宝が池","たからがいけ","Takaragaike (p)"],';

  text += '["宝とも子","たからともこ","Takara Tomoko (1921.9.23-2001.8.2) (h)"],';

  text += '["宝の草池","たからのくさいけ","Takaranokusaike (p)"]]';

  //-----------------------------------------------------------------------------------------------------------
  demo = function() {
    var pipeline, source, splitter;
    // path      = PATH.join __dirname, '../../../../Downloads/Japanese-English-Dictionary/Dict_7.json'
    source = (require('../tests/njs-streams-and-files.test'))._as_chunked_buffers(text, 10);
    splitter = '"],["';
    pipeline = [];
    // pipeline.push SP.read_from_file path, 10
    pipeline.push(source);
    pipeline.push(SP.$split(splitter));
    pipeline.push($(function(d, send) {
      d = d.replace(/^\[+"/, '');
      d = d.replace(/"\]+$/, '');
      return send(d);
    }));
    pipeline.push($(function(d, send) {
      return send(JSON.parse('["' + d + '"]'));
    }));
    pipeline.push($watch(function(d) {
      return info(jr(d));
    }));
    pipeline.push(SP.$drain());
    SP.pull(...pipeline);
    return null;
  };

  //###########################################################################################################
  if (module.parent == null) {
    demo();
  }

}).call(this);
