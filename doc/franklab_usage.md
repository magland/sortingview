# Frank lab usage

## Visualizing a recording/sorting pair

See [examples/example2.py](examples/old/example2.py)

[View figURL](https://figurl.org/f?v=gs://figurl/spikesortingview-6&d=sha1://b8c937f982a0308d6a5d8c440b7a01e7cf578447&label=test%20mountain%20layout)

## Reloading a workspace

A workspace can be reloaded from an existing URI. For example:

```python
import sortingview as sv

uri = ...
W = sv.load_workspace(uri)
```

## Creating a copy of a recording/sorting extractor

Only some recording/sorting extractor types are supported by sortingview (see below for the list).
If you have extractors that are not supported, you can create copies
that are compatible:

```python
import sortingview as sv

recording = ...
sorting = ...

R = sv.copy_recording_extractor(recording=recording, serialize_dtype='float32')
S = sv.copy_sorting_extractor(sorting=sorting)
```

## Multi-panel timeseries visualization

See [examples/old_timeseries_panels.py](examples/old_timeseries_panels.py)

[View figURL](https://www.figurl.org/f?v=gs://figurl/spikesortingview-2&d=ipfs://bafkreictlxjsm5c35hz5gs4x4z6e3k5wumcqujytabfygjceecfowdx7li&project=siojtbyvbw&label=Jaq_03_12_visualization_data)

Note: you should instead use the layout method for this. Needs example and documentation.

## Supported SpikeInterface extractors

The following sorting/recording extractor types are currently supported by sortingview:

* NpzSortingExtractor
* MdaSortingExtractor
* NwbSortingExtractor
* NwbRecordingExtractor
* BinaryRecordingExtractor
* ConcatenateSegmentRecording

If your extractor is not one of these types you can use `copy_*_extractor()` as above to create a copy that is supported, or request support for your extractor.

## Backward compatibility

This version of sortingview (`>= 0.8.*`) uses kachery-cloud whereas the previous version (`0.7.*`) used kachery-daemon and kachery-client.
The previous version is on the v1 branch. This version is on the main branch.