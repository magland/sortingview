import hither2 as hi

class job_handler:
    correlograms = hi.ParallelJobHandler(num_workers=4)
    timeseries = hi.ParallelJobHandler(num_workers=4)
    waveforms = hi.ParallelJobHandler(num_workers=4)
    clusters = hi.ParallelJobHandler(num_workers=4)
    metrics = hi.ParallelJobHandler(num_workers=4)
    misc = hi.ParallelJobHandler(num_workers=4)
    extract_snippets = hi.ParallelJobHandler(num_workers=4)