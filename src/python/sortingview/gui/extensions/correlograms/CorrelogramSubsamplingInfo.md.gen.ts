const text: string = "# Subsampling\n\nFor efficiency, sortings are subsampled when creating auto- and cross-correlograms.\n " +
"Sampling using tight time windows poses the risk that one of a pair of firing events\n" +
"will fall outside the window, and fail to be detected--particularly for units with\n" +
"lower firing rates. However, using long contiguous windows risks inducing bias\n" +
"toward particular areas of the recording.\n\n" +
"The default sampling strategy strikes a balance between these risks by sampling\n" +
"all units in 100 slices of 10 seconds each, resulting in 1000 seconds of observations\n" +
"evenly distributed across the duration of the recording. Sampling is only used if\n" +
"less than half of the recording would be included in the samples; shorter recordings\n" +
"are used in their entirety."

export default text