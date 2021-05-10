import React, { FunctionComponent, useCallback, useState } from 'react';
import Expandable from '../../common/Expandable';
import Markdown from '../../common/Markdown';
import { WorkspaceRoute } from '../../pluginInterface';
import spykingcircus_example_py from './sortingExamples/spykingcircus_example.py.gen';
import instructionsMd from './SortingInstructions.md.gen';

type Props = {
    workspaceRoute: WorkspaceRoute
    recordingId: string
    recordingLabel: string
}

const SortingInstructions: FunctionComponent<Props> = ({ workspaceRoute, recordingId, recordingLabel }) => {
    const s = (x: string) => {
        return doSubstitute(x, {
            workspaceUri: workspaceRoute.workspaceUri,
            recordingId,
            recordingLabel
        })
    }
    return (
        <div>
            <Markdown
                source={instructionsMd}
            />
            <Expandable label="SpyKING CIRCUS">
                <CopyToClipboardButton text={s(spykingcircus_example_py)} />
                <Markdown source={mdWrapPy(s(spykingcircus_example_py))} />
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

export default SortingInstructions