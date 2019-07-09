<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [SteamPipes](#steampipes)
  - [Motivation](#motivation)
  - [Notes](#notes)
    - [Ducts](#ducts)
      - [Duct Configurations](#duct-configurations)
    - [Behavior for Ending Streams](#behavior-for-ending-streams)
    - [Aborting Streams](#aborting-streams)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# SteamPipes

**Fast, simple data pipelines** built from first principles.

SteamPipes is the successor to [PipeStreams](https://github.com/loveencounterflow/pipestreams) and
[PipeDreams](https://github.com/loveencounterflow/pipedreams). PipeStreams was originally built on top of
[NodeJS streams](X███████████████) and [through](X███████████████); from version X███████████████ on, I
switched to [pull-streams](https://pull-stream.github.io).

## Motivation

* Performance, X███████████████ insert benchmarks
* Simplicity of implementation, no recursion
* Observability, the data pipeline is an array of arrays that one may inspect

## Notes

### Ducts


#### Duct Configurations

**I. Special Arities**

Two special arities: `empty` and `single`. `empty` is always a no-op, hence discardable; `single` always
equivalent to the sole transform.

```coffee
⋆ []                                  ⇨ { is_empty:  true,       } # equiv. to a no-op
⋆ [ x, ]                              ⇨ { is_single: true,       } # equiv. to its single member
```

**II. Open Ducts**

Open ducts may always take the place of a non-composite element of the same type; this is what makes
pipelines composable. As one can always replace a sequence like `( x += a ); ( x += b );` by a
non-composed equivalent `( x += a + b )`, so can one replace a non-composite through (i.e. a single
function that transforms values) with a composite one (i.e. a list of throughs), and so on:

```coffee
⋆ [ source, transforms...,        ]   ⇨ { type:      'source',   } # equiv. to a non-composite source
⋆ [         transforms...,        ]   ⇨ { type:      'through',  } # equiv. to a non-composite transform
⋆ [         transforms..., sink,  ]   ⇨ { type:      'sink',     } # equiv. to a non-composite sink
```

**III. Closed Ducts**

Closed ducts are pipelines that have both a source and a sink (plus any number of throughs). They are like a
closed electric circuit and will start running when being passed to the `pull()` method (but note that
actual data flow may be indefinitely postponed in case the source does not start delivering immediately).

```coffee
⋆ [ source, transforms..., sink,  ]   ⇨ { type:      'circuit',  } # ready to run
```

### Behavior for Ending Streams

Two ways to end a stream from inside a transform: either

1)  call `send.end()`, or
2)  `send SP.symbols.end`.

The two methods are 100% identical. In SteamPipes, 'ending a stream' means 'to break from the loop that
iterates over the data source'.

Note that when the `pull` method receives an `end` signal, it will not request any further data from the
source, *but* it *will* allow all data that is already in the pipeline to reach the sink just as in regular
operation, and it will also supply all transforms that have requested a `last` value with such a terminal
value.

Any of these actions may cause any of the transforms to issue an unlimited number of further values, so
that, in the general case, `end`ing a stream is not guaranteed to actually stop processing at any point in
time; this is only true for properly coöperating transforms.



### Aborting Streams

There's no API to *abort* a stream—i.e. make the stream and all transforms cease and desist immediately—but
you can always wrap the `pull pipeline...` invocation into a `try`/`catch` clause and throw a custom
symbolic value:

```coffee
pipeline = []
...
pipeline.push $ ( d, send ) ->
  ...
  throw 'OHNOES!'
  ...
...
try
  pull pipeline...
catch error
  throw error if error isnt 'OHNOES!'
  warn "the stream was aborted"
...
```
