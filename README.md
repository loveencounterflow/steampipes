

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

### Behavior for Ending Streams

Two ways to end a stream from inside a transform: either

1)	call `send.end()`, or
2)	`send SP.symbols.end`.

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
