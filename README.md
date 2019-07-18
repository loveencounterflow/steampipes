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


## How to Construct Sources, Transforms, and Sinks

### Transforms

* Functions that take 2 arguments `d` and `send` (includes `send.end()`);
* must/should/may have a list (`Array`) that acts as so-called 'local sink' (this is where data send with
  `send d` is stored before being passed to the next transform);
* property to indicate whether transform is asynchronous.

* transforms have a property `sink`, which must be a list (at least have a `shift()` method);
* TF may add (ordinarily `push()`) values to the sink at any time (but processing only guaranteed when this
  happens, in TFs marked synchronous, before the main body of the function completed, and in TFs marked
  asynchronous, before `done()` has been called).
* conceivable to use *same* TF, same `sink` in two or more pipelines simultaneously; conceivable to accept
  values from other sources than the TF which is directly upstream; hence possible to construct wyes (i.e.
  data sources that appear in mid-stream).

### Sinks

Arbitrary objects can act as sinks provided they have a `sink` property; this property must be either set to
`true` for a generic sink or else be an object that has `push()` method (such as a list). A sink may,
furthermore, also have an `on_end()` method which, if set, must be a function that takes zero or one
argument.

If the `sink` property is a list, then it will receive all data items that arrive through the pipeline (the
resultant data of the pipeline); if it is `true`, then those data items will be discarded.

The `on_end()` method will be called when streaming has terminated (since the source was exhausted or a
transform called `aend.end()`); if it takes one argument, then that will be the list of resultant data. If
both the `sink` property has been set to a list and `on_end()` takes an argument, then that value will be
the `sink` property (you probably only want the one or the other in most cases).

```coffee
{ sink: true, }
{ sink: true, on_end: ( -> do_something() ), }
{ sink: true, on_end: ( ( result ) -> do_something result ), }
{ sink: x,    on_end: ( ( result ) -> do_something result ### NB result is x ### ), }
```

The only SteamPipes method that produces a sink is `$drain()` (it should really be called `sink()` but for
compatibility with PipeStreams the name has been kept as a holdover from `pull-stream`). `$drain()` takes
zero, one or two arguments:

```coffee
$drain()                is equiv. to   { sink: true, }
$drain                     -> ...     is equiv. to   { sink: true, on_end: (       -> ... ), }
$drain               ( x ) -> ...     is equiv. to   { sink: true, on_end: ( ( x ) -> ... ), }
$drain { sink: x, },       -> ...     is equiv. to   { sink: x,    on_end: (       -> ... ), }
$drain { sink: x, }, ( x ) -> ...     is equiv. to   { sink: x,    on_end: ( ( x ) -> ... ), }
```

## Asynchronous Sources and Transforms

Asynchronous transforms can be constructed using the 'asynchronous remit' method, `$async()`. The method
passed into `$async()` must accept three arguments, namely `d` (the data item coming down the pipeline),
`send` (the method to send data down the pipeline), and, in addition to synchronous transforms, `done`,
which is a callback function used to signal completion (it is analogous to the `resulve` argument of
promises, `new Promise ( resulve, reject ) ->` and indeed implemented as such). An example:

```coffee
X███████████████
X███████████████
X███████████████
X███████████████
```



## Ducts


### Duct Configurations

**I. Special Arities**

There are two special duct arities, empty and single. An empty pipeline producers a duct marked with
`is_empty: true`; it is always a no-op, hence discardable. The duct does not have a `type` property.

A pipeline with a single element produces a duct with the property `is_single: true`; it is always
equivalent to its sole transform, and its `type` property is that of its sole element.

```coffee
SHAPE OF PIPELINE                     SHAPE OF DUCT                   REMARKS
⋆ []                                  ⇨ { is_empty:  true,       } # equiv. to a no-op
⋆ [ x, ]                              ⇨ { is_single: true,       } # equiv. to its single member
```

**II. Open Ducts**

Open ducts may always take the place of a non-composite element of the same type; this is what makes
pipelines composable. As one can always replace a sequence like `( x += a ); ( x += b );` by a
non-composed equivalent `( x += a + b )`, so can one replace a non-composite through (i.e. a single
function that transforms values) with a composite one (i.e. a list of throughs), and so on:

```coffee
SHAPE OF PIPELINE                     SHAPE OF DUCT                   REMARKS
⋆ [ source, transforms...,        ]   ⇨ { type:      'source',   } # equiv. to a non-composite source
⋆ [         transforms...,        ]   ⇨ { type:      'through',  } # equiv. to a non-composite transform
⋆ [         transforms..., sink,  ]   ⇨ { type:      'sink',     } # equiv. to a non-composite sink
```

**III. Closed Ducts**

Closed ducts are pipelines that have both a source and a sink (plus any number of throughs). They are like a
closed electric circuit and will start running when being passed to the `pull()` method (but note that
actual data flow may be indefinitely postponed in case the source does not start delivering immediately).

```coffee
SHAPE OF PIPELINE                     SHAPE OF DUCT                   REMARKS
⋆ [ source, transforms..., sink,  ]   ⇨ { type:      'circuit',  } # ready to run
```

## Behavior for Ending Streams

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



## Aborting Streams

There's no API to abort a stream—i.e. make the stream and all transforms stop processing immediately—but one
can always wrap the `pull pipeline...` invocation into a `try`/`catch` clause and throw a custom symbolic
value:

```coffee
pipeline = []
...
pipeline.push $ ( d, send ) ->
  ...
  throw 'abort'
  ...
...
try
  pull pipeline...
catch error
  throw error if error isnt 'abort'
  warn "the stream was aborted"
...
```
