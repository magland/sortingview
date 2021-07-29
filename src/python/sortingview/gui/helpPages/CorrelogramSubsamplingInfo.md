# Correlogram subsampling

For efficiency, sortings are subsampled when creating auto- and cross-correlograms.
Since cross-correlograms make comparisons between different units, the spike trains
are sampled according to windows of time, rather than sampling firing events--pure
random subsampling of events is not optimal because it is less likely that both
spikes in an event pair which could appear in the histogram will be part of the
random sample.

Even with time-based sampling, there is a risk of missing pairs of events that
ought to appear in the histogram. In particular, if the sample windows are
brief, there is a risk that the window will capture only one-half of a pair of
firing events. However, more protracted time samples increase the risk of
inducing bias toward certain areas of the recording.

The default sampling strategy strikes a balance between these risks by sampling
all units in 100 slices of 10 seconds each, resulting in 1000 seconds of observations
evenly distributed across the duration of the recording. Sampling is only used if
less than half of the recording would be included in the samples; shorter recordings
are used in their entirety.
