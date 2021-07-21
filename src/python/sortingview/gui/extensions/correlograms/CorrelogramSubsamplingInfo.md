# Subsampling

For efficiency, sortings are subsampled when creating auto- and cross-correlograms.
Sampling using tight time windows poses the risk that one of a pair of firing events
will fall outside the window, and fail to be detected--particularly for units with
lower firing rates. However, using long contiguous windows risks inducing bias
toward particular areas of the recording.

The default sampling strategy strikes a balance between these risks by sampling
all units in 100 slices of 10 seconds each, resulting in 1000 seconds of observations
evenly distributed across the duration of the recording. Sampling is only used if
less than half of the recording would be included in the samples; shorter recordings
are used in their entirety.
