import React, { FunctionComponent, useCallback, useState } from 'react';
import Expandable from '../../common/Expandable';
import Markdown from '../../common/Markdown';
import { WorkspaceRoute } from '../../pluginInterface';
import import_example_simulated_recording_py from './importExamples/import_example_simulated_recording.py.gen';
import import_nwb_recording_py from './importExamples/import_nwb_recording.py.gen';
import import_spikeforest_recording_py from './importExamples/import_spikeforest_recording.py.gen';
import instructionsMd from './ImportRecordingsInstructions.md.gen';

type Props = {
    workspaceRoute: WorkspaceRoute
}

const ImportRecordingsInstructions: FunctionComponent<Props> = ({ workspaceRoute }) => {
    const s = (x: string) => {
        return doSubstitute(x, {
            workspaceUri: workspaceRoute.workspaceUri
        })
    }
    return (
        <div>
            <Markdown
                source={instructionsMd}
            />
            <Expandable label="Import example simulated recording">
                <CopyToClipboardButton text={s(import_example_simulated_recording_py)} />
                <Markdown source={mdWrapPy(s(import_example_simulated_recording_py))} />
            </Expandable>
            <Expandable label="Import SpikeForest recordings">
                <CopyToClipboardButton text={s(import_spikeforest_recording_py)} />
                <Markdown source={mdWrapPy(s(import_spikeforest_recording_py))} />
            </Expandable>
            <Expandable label="Import NWB recordings">
                <CopyToClipboardButton text={s(import_nwb_recording_py)} />
                <Markdown source={mdWrapPy(s(import_nwb_recording_py))} />
            </Expandable>
        </div>
    )
}

const mdWrapPy = (py: string) => {
    return "```python\n" + py + '\n```'
}

type CopyToClipboardButtonProps = {
    text: string
}

const CopyToClipboardButton: FunctionComponent<CopyToClipboardButtonProps> = ({ text }) => {
    const [copied, setCopied] = useState(false)
    const handleClick = useCallback(() => {
        // see: https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
        if (!window.isSecureContext) {
            window.alert('Unable to copy to clipbard (not a secure context). This is probably because this site uses http rather than https.')
            return
        }
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 3000)
    }, [text])
    return (
        <button onClick={handleClick}>{copied ? `Copied` : `Copy to clipboard`}</button>
    )
}

const doSubstitute = (x: string, s: {[key: string]: string | undefined | null}) => {
    let y = x
    for (let k in s) {
        y = y.split(`{${k}}`).join(s[k] || '')
    }
    return y
}

export default ImportRecordingsInstructions