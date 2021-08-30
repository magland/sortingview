from time import time
from typing import List, Literal, Union
import kachery_client as kc
import numpy as np
from ._estimate_sampling_frequency import _estimate_sampling_frequency

class TimeseriesModelNwbV1:
    def __init__(self, *, nwb_uri: str, electrical_series_name: Union[str, None]=None):
        self._path = kc.load_file(nwb_uri)
        assert self._path is not None, f'Unable to load nwb file: {nwb_uri}'
        self._nwb_uri = nwb_uri
        self._electrical_series_name = electrical_series_name

        self._initialize()
    def _initialize(self):
        from pynwb import NWBHDF5IO
        from pynwb.ecephys import ElectrodeGroup
        with NWBHDF5IO(self._path, 'r') as io:
            nwbfile = io.read()
            if self._electrical_series_name is None:
                a_names = list(nwbfile.acquisition)
                if len(a_names) > 1:
                    raise ValueError('More than one acquisition found. You must specify electrical_series.')
                if len(a_names) == 0:
                    raise ValueError('No acquisitions found in the .nwb file.')
                self._electrical_series_name = a_names[0]
            es = nwbfile.acquisition[self._electrical_series_name]
            if hasattr(es, 'timestamps') and es.timestamps:
                self._timestamps: np.ndarray = es.timestamps
                self._sampling_frequency = _estimate_sampling_frequency(self._timestamps)
            else:
                self._sampling_frequency = es.rate
                if hasattr(es, 'starting_time'):
                    start_time = es.starting_time
                else:
                    start_time = 0.
                num_samples = es.data.shape[0]
                self._timestamps = start_time + np.arange(num_samples) / self._sampling_frequency
            
            num_channels = len(es.electrodes.table.id[:])

            # Channels gains - for RecordingExtractor, these are values to cast traces to uV
            if es.channel_conversion is not None:
                gains = es.conversion * es.channel_conversion[:] * 1e6
            else:
                gains = es.conversion * np.ones(num_channels) * 1e6

            # # Extractors channel groups must be integers, but Nwb electrodes group_name can be strings
            # if 'group_name' in nwbfile.electrodes.colnames:
            #     unique_grp_names = list(np.unique(nwbfile.electrodes['group_name'][:]))

            # Fill channel properties dictionary from electrodes table
            self._channel_names = [str(c) for c in es.electrodes.table.id[es.electrodes.data]]
            self._channel_properties = {}
            for c in self._channel_names:
                self._channel_properties[c] = {}
            for es_ind, (channel_name, electrode_table_index) in enumerate(zip(self._channel_names, es.electrodes.data)):
                self._channel_properties[channel_name]['gain'] = gains[es_ind]
                this_loc = []
                if 'rel_x' in nwbfile.electrodes:
                    this_loc.append(nwbfile.electrodes['rel_x'][electrode_table_index])
                    if 'rel_y' in nwbfile.electrodes:
                        this_loc.append(nwbfile.electrodes['rel_y'][electrode_table_index])
                    else:
                        this_loc.append(0)
                    self._channel_properties[channel_name]['location'] = this_loc

                for col in nwbfile.electrodes.colnames:
                    if isinstance(nwbfile.electrodes[col][electrode_table_index], ElectrodeGroup):
                        continue
                    elif col == 'group_name':
                        self._channel_properties[channel_name]['group_name'] = nwbfile.electrodes[col][electrode_table_index]
                    elif col == 'location':
                        self._channel_properties[channel_name]['brain_area'] = nwbfile.electrodes[col][electrode_table_index]
                    elif col in ['x', 'y', 'z', 'rel_x', 'rel_y', 'group_name', 'location']:
                        continue
                    else:
                        self._channel_properties[channel_name][col] = nwbfile.electrodes[col][electrode_table_index]

            # Fill epochs dictionary
            self._epochs = {}
            if nwbfile.epochs is not None:
                df_epochs = nwbfile.epochs.to_dataframe()
                self._epochs = {row['tags'][0]: {
                    'start_frame': row['start_time'],
                    'end_frame': row['stop_time']}
                    for _, row in df_epochs.iterrows()}

            
            # Make metadata
            # Metadata dictionary - useful for constructing a nwb file
            self._nwb_metadata = dict()
            self._nwb_metadata['NWBFile'] = {
                'session_description': nwbfile.session_description,
                'identifier': nwbfile.identifier,
                'session_start_time': nwbfile.session_start_time,
                'institution': nwbfile.institution,
                'lab': nwbfile.lab
            }
            self._nwb_metadata['Ecephys'] = dict()
            # Update metadata with Device info
            self._nwb_metadata['Ecephys']['Device'] = []
            for dev in nwbfile.devices:
                self._nwb_metadata['Ecephys']['Device'].append({'name': dev})
            # Update metadata with ElectrodeGroup info
            self._nwb_metadata['Ecephys']['ElectrodeGroup'] = []
            for k, v in nwbfile.electrode_groups.items():
                self._nwb_metadata['Ecephys']['ElectrodeGroup'].append({
                    'name': v.name,
                    'description': v.description,
                    'location': v.location,
                    'device': v.device.name
                })
            # Update metadata with ElectricalSeries info
            self._nwb_metadata['Ecephys']['ElectricalSeries'] = []
            self._nwb_metadata['Ecephys']['ElectricalSeries'].append({
                'name': es.name,
                'description': es.description
            })
    @property
    def channel_names(self):
        return self._channel_names
    @property
    def channel_properties(self):
        return self._channel_properties
    @property
    def num_samples(self):
        return len(self._timestamps)
    @property
    def start_time(self):
        return self._timestamps[0]
    @property
    def end_time(self):
        return self._timestamps[-1]
    @property
    def type(self) -> Union[Literal['continuous'], Literal['discrete']]:
        return 'continuous'
    def get_samples(self, start: float, end: float, channel_inds: Union[List[int], range]):
        from pynwb import NWBHDF5IO
        with NWBHDF5IO(self._path, 'r') as io:
            nwbfile = io.read()
            es = nwbfile.acquisition[self._electrical_series_name]

            traces = np.array([])
            # fix this part
            # es_channel_ids = np.array(es.electrodes.table.id[:])[es.electrodes.data[:]].tolist()
            # channel_inds = [es_channel_ids.index(id) for id in channel_ids]
            # if np.array(channel_ids).size > 1 and np.any(np.diff(channel_ids) < 0):
            #     # get around h5py constraint that it does not allow datasets
            #     # to be indexed out of order
            #     sorted_channel_ids = np.sort(channel_ids)
            #     sorted_idx = np.array([list(sorted_channel_ids).index(ch) for ch in channel_ids])
            #     recordings = es.data[start_frame:end_frame, sorted_channel_ids].T
            #     traces = recordings[sorted_idx, :]
            # else:
            #     traces = es.data[start_frame:end_frame, channel_inds].T
            # # This DatasetView and lazy operations will only work within context
            # # We're keeping the non-lazy version for now
            # # es_view = DatasetView(es.data)  # es is an instantiated h5py dataset
            # # traces = es_view.lazy_slice[start_frame:end_frame, channel_ids].lazy_transpose()
        return traces
    @property
    def sampling_frequency(self):
        return self._sampling_frequency
