import 'github-markdown-css'
import React, { FunctionComponent } from 'react'
import ReactMarkdown from "react-markdown"
import MarkdownCodeBlock from "./MarkdownCodeBlock"

interface Props {
    source: string
    substitute?: {[key: string]: string | undefined | null}
}

const Markdown: FunctionComponent<Props> = ({source, substitute}) => {
    const source2 = substitute ? doSubstitute(source, substitute) : source
    return (
        <div className='markdown-body'>
            <ReactMarkdown
                source={source2}
                renderers={{ code: MarkdownCodeBlock }}
            />
        </div>
    );
}

const doSubstitute = (x: string, s: {[key: string]: string | undefined | null}) => {
    let y = x
    for (let k in s) {
        y = y.split(`{${k}}`).join(s[k] || '')
    }
    return y
}

export default Markdown