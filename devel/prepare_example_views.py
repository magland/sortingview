# Tested with sortingview 0.6.34 on 12/9/21
# Generated:
# https://figurl.org/f?v=gs://figurl/sortingview-gui-1&d=9150b17b93e6bc922235bf94178a406eb5d69704&channel=spikeforest&label=synth_magland_noise10_K10_C4/001_synth
# https://figurl.org/f?v=gs://figurl/sortingview-gui-1&d=91765605c62444029b5892424bf0098de7d402fb&channel=franklab2&label=Tetrode%20example%201
# https://figurl.org/f?v=gs://figurl/sortingview-gui-1&d=458ad0027d4f936a21c9a78045b43265916190e2&channel=franklab2&label=Tetrode%20example%202
# https://figurl.org/f?v=gs://figurl/sortingview-gui-1&d=767c0bee71f1cfd66e895fe260237496313be78e&channel=franklab2&label=32-channel%20probe%20example

import figurl as fig

X = [
    {
        'workspace_uri': 'workspace://1054aa900237bde576aa78e48b73f4f2ec3eb64f3f9c95a05316f75db932e45b',
        'label': 'synth_magland_noise10_K10_C4/001_synth',
        'channel': 'spikeforest'
    },
    {
        'workspace_uri': 'workspace://42df9ae1864d511ab9227409e93c7a512c0ff59b075c9c65c78d10b8d6e714f2?label=despereaux20191125_.nwb_02_r1_13',
        'label': 'Tetrode example 1',
        'channel': 'franklab2'
    },
    {
        'workspace_uri': 'workspace://1538a009c271cafffe1286e525b6f3aa7b78708f76ee6f6f90d2723916d8cf03?label=despereaux20191125_.nwb_02_r1_8',
        'label': 'Tetrode example 2',
        'channel': 'franklab2'
    },
    {
        'workspace_uri': 'workspace://9040152cbc96c6cfbd97c238c36a274f41962491195e4418de19ff5418d95191?label=wilbur20210326_JVXNAIA537.nwb',
        'label': '32-channel probe example',
        'channel': 'franklab2'
    }
]

for x in X:
    data = {
        'type': 'workspace',
        'workspaceUri': x['workspace_uri']
    }
    F = fig.Figure(view_url='gs://figurl/sortingview-gui-1', data=data)
    url = F.url(channel=x['channel'], label=x['label'])
    print(url)