export interface RecordingInfo {
    sampling_frequency: number
    channel_ids: number[]
    channel_groups: number[]
    geom: (number[])[]
    num_frames: number
    noise_level: number
    recording_object: any
}

export interface Recording {
    recordingId: string
    recordingLabel: string
    recordingObject: any
    recordingPath: string
}