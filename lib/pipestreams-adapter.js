(function() {
  'use strict';
  var CND, PD, alert, badge, debug, echo, help, info, log, rpr, urge, warn, whisper;

  //###########################################################################################################
  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/PIPESTREAM-ADAPTER';

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
  PD = require('pipedreams');

  //-----------------------------------------------------------------------------------------------------------
  this.adapt_ps_transform = function(ps_transform) {
    var pipeline, ps_source, send;
    ps_source = PD.new_push_source();
    send = null;
    pipeline = [];
    pipeline.push(ps_source);
    pipeline.push(ps_transform);
    pipeline.push(PD.$show({
      title: 'PS pipeline'
    }));
    pipeline.push(PD.$watch(function(d) {
      return send(d);
    }));
    pipeline.push(PD.$drain(function() {}));
    PD.pull(...pipeline);
    return this.$(function(d, send_) {
      send = send_;
      return ps_source.send(d);
    });
  };

}).call(this);