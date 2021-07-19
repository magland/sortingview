from sortingview import load_workspace, LabboxEphysSortingExtractor

if __name__ == '__main__':
    # adjust these values
    workspace_uri = '{workspaceUri}'
    recording_id = '{recordingId}' # {recordingLabel}

    workspace = load_workspace(workspace_uri)
    le_recording = workspace.get_recording(recording_id)
    recording_object = le_recording['recordingObject']

    sorting_object = sorters.mountainsort4( # need to move this over from labbox ephys
        recording_object=recording_object,
        num_workers=1
    )
    sorting = LabboxEphysSortingExtractor(sorting_object)

    S_id = workspace.add_sorting(
        sorting=sorting,
        recording_id=recording_id,
        label='mountainsort4'
    )