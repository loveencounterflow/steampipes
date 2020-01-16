(function() {
  //###########################################################################################################
  var CND, FS, OS, PATH, alert, badge, debug, defer, echo, help, info, inspect, isa, jr, log, probes_and_matchers, read, rpr, show, test, type_of, types, urge, validate, warn, whisper, xrpr;

  CND = require('cnd');

  rpr = CND.rpr;

  badge = 'STEAMPIPES/TESTS/HTML-PARSER';

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

  //...........................................................................................................
  // SP                        = require '../..'
  // { $
  //   $async
  //   $watch
  //   $show  }                = SP.export()
  //...........................................................................................................
  types = require('../types');

  ({isa, validate, type_of} = types);

  //...........................................................................................................
  read = function(path) {
    return FS.readFileSync(path, {
      encoding: 'utf-8'
    });
  };

  defer = setImmediate;

  ({inspect} = require('util'));

  xrpr = function(x) {
    return inspect(x, {
      colors: true,
      breakLength: 2e308,
      maxArrayLength: 2e308,
      depth: 2e308
    });
  };

  jr = JSON.stringify;

  //-----------------------------------------------------------------------------------------------------------
  probes_and_matchers = [
    [
      "<!DOCTYPE html>",
      [
        {
          "data": {
            "html": true
          },
          "$key": "<!DOCTYPE"
        }
      ],
      null
    ],
    [
      "<title>MKTS</title>",
      [
        {
          "$key": "<title"
        },
        {
          "text": "MKTS",
          "$key": "^text"
        },
        {
          "$key": ">title"
        }
      ],
      null
    ],
    [
      "<document/>",
      [
        {
          "$key": "<document"
        },
        {
          "$key": ">document"
        }
      ],
      null
    ],
    [
      "<foo bar baz=42>",
      [
        {
          "data": {
            "bar": true,
            "baz": "42"
          },
          "$key": "<foo"
        }
      ],
      null
    ],
    [
      "<br/>",
      [
        {
          "$key": "<br"
        },
        {
          "$key": ">br"
        }
      ],
      null
    ],
    [
      "</thing>",
      [
        {
          "$key": ">thing"
        }
      ],
      null
    ],
    [
      "</foo>",
      [
        {
          "$key": ">foo"
        }
      ],
      null
    ],
    [
      "</document>",
      [
        {
          "$key": ">document"
        }
      ],
      null
    ],
    [
      "<title>MKTS</title>",
      [
        {
          "$key": "<title"
        },
        {
          "text": "MKTS",
          "$key": "^text"
        },
        {
          "$key": ">title"
        }
      ],
      null
    ],
    [
      "<p foo bar=42>omg</p>",
      [
        {
          "data": {
            "foo": true,
            "bar": "42"
          },
          "$key": "<p"
        },
        {
          "text": "omg",
          "$key": "^text"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<document/><foo bar baz=42>something<br/>else</thing></foo>",
      [
        {
          "$key": "<document"
        },
        {
          "$key": ">document"
        },
        {
          "data": {
            "bar": true,
            "baz": "42"
          },
          "$key": "<foo"
        },
        {
          "text": "something",
          "$key": "^text"
        },
        {
          "$key": "<br"
        },
        {
          "$key": ">br"
        },
        {
          "text": "else",
          "$key": "^text"
        },
        {
          "$key": ">thing"
        },
        {
          "$key": ">foo"
        }
      ],
      null
    ],
    [
      "<!DOCTYPE html><html lang=en><head><title>x</title></head><p data-x='<'>helo</p></html>",
      [
        {
          "data": {
            "html": true
          },
          "$key": "<!DOCTYPE"
        },
        {
          "data": {
            "lang": "en"
          },
          "$key": "<html"
        },
        {
          "$key": "<head"
        },
        {
          "$key": "<title"
        },
        {
          "text": "x",
          "$key": "^text"
        },
        {
          "$key": ">title"
        },
        {
          "$key": ">head"
        },
        {
          "data": {
            "data-x": "<"
          },
          "$key": "<p"
        },
        {
          "text": "helo",
          "$key": "^text"
        },
        {
          "$key": ">p"
        },
        {
          "$key": ">html"
        }
      ],
      null
    ],
    [
      "<p foo bar=42><em>Yaffir stood high</em></p>",
      [
        {
          "data": {
            "foo": true,
            "bar": "42"
          },
          "$key": "<p"
        },
        {
          "$key": "<em"
        },
        {
          "text": "Yaffir stood high",
          "$key": "^text"
        },
        {
          "$key": ">em"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<p foo bar=42><em><xxxxxxxxxxxxxxxxxxx>Yaffir stood high</p>",
      [
        {
          "data": {
            "foo": true,
            "bar": "42"
          },
          "$key": "<p"
        },
        {
          "$key": "<em"
        },
        {
          "$key": "<xxxxxxxxxxxxxxxxxxx"
        },
        {
          "text": "Yaffir stood high",
          "$key": "^text"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<p föö bär=42><em>Yaffir stood high</p>",
      [
        {
          "data": {
            "föö": true,
            "bär": "42"
          },
          "$key": "<p"
        },
        {
          "$key": "<em"
        },
        {
          "text": "Yaffir stood high",
          "$key": "^text"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<document 文=zh/><foo bar baz=42>something<br/>else</thing></foo>",
      [
        {
          "data": {
            "文": "zh"
          },
          "$key": "<document"
        },
        {
          "$key": ">document"
        },
        {
          "data": {
            "bar": true,
            "baz": "42"
          },
          "$key": "<foo"
        },
        {
          "text": "something",
          "$key": "^text"
        },
        {
          "$key": "<br"
        },
        {
          "$key": ">br"
        },
        {
          "text": "else",
          "$key": "^text"
        },
        {
          "$key": ">thing"
        },
        {
          "$key": ">foo"
        }
      ],
      null
    ],
    [
      "<p foo bar=<>yeah</p>",
      [
        {
          "data": {
            "foo": true,
            "bar": "<"
          },
          "$key": "<p"
        },
        {
          "text": "yeah",
          "$key": "^text"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<p foo bar='<'>yeah</p>",
      [
        {
          "data": {
            "foo": true,
            "bar": "<"
          },
          "$key": "<p"
        },
        {
          "text": "yeah",
          "$key": "^text"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<p foo bar='&lt;'>yeah</p>",
      [
        {
          "data": {
            "foo": true,
            "bar": "&lt;"
          },
          "$key": "<p"
        },
        {
          "text": "yeah",
          "$key": "^text"
        },
        {
          "$key": ">p"
        }
      ],
      null
    ],
    [
      "<<<<<",
      [
        {
          "text": "<<<<",
          "$key": "^text"
        }
      ],
      null
    ],
    [
      "something",
      [
        {
          "text": "something",
          "$key": "^text"
        }
      ],
      null
    ],
    [
      "else",
      [
        {
          "text": "else",
          "$key": "^text"
        }
      ],
      null
    ],
    [
      "<p>dangling",
      [
        {
          "$key": "<p"
        },
        {
          "text": "dangling",
          "$key": "^text"
        }
      ],
      null
    ],
    [
      "𦇻𦑛𦖵𦩮𦫦𧞈",
      [
        {
          "text": "𦇻𦑛𦖵𦩮𦫦𧞈",
          "$key": "^text"
        }
      ],
      null
    ]
  ];

  //-----------------------------------------------------------------------------------------------------------
  show = function(html, datoms) {
    var d, i, len;
    help(CND.red(html));
    for (i = 0, len = datoms.length; i < len; i++) {
      d = datoms[i];
      if (d.text != null) {
        info(d.$key, CND.white(jr(d.text)));
      } else {
        if (d.data != null) {
          info(d.$key, CND.yellow(jr(d.data)));
        } else {
          info(d.$key); // and ( Object.keys d.data ).length > 0
        }
      }
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  this["parse html to list (onepiece)"] = async function(T, done) {
    var SP, error, i, len, matcher, parse, probe;
    SP = require('../..');
    T.eq(type_of(SP.HTML.new_onepiece_parser), 'function');
    parse = SP.HTML.new_onepiece_parser();
//.........................................................................................................
    for (i = 0, len = probes_and_matchers.length; i < len; i++) {
      [probe, matcher, error] = probes_and_matchers[i];
      await T.perform(probe, matcher, error, function() {
        return new Promise(function(resolve, reject) {
          var html, result;
          html = probe;
          result = parse(html);
          // show html, result
          resolve(result);
          return null;
        });
      });
    }
    //.........................................................................................................
    done();
    return null;
  };

  // R           = []
  // source      = probe
  // #.....................................................................................................
  // pipeline_A  = []
  // pipeline_A.push source
  // pipeline_A.push SP.$watch ( d ) -> info xrpr d
  // pipeline_A.push SP.$collect { collector: R, }
  // length_of_A = pipeline_A.length
  // duct_A = SP.pull pipeline_A...
  // T.eq duct_A.transforms.length,  length_of_A
  // T.eq duct_A.type,               'source'

  //###########################################################################################################
  if (module.parent == null) {
    // test @, 'timeout': 30000
    test(this["parse html to list (onepiece)"]);
  }

}).call(this);
