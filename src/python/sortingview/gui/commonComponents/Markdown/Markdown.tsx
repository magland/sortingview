import 'github-markdown-css'
import React, { FunctionComponent } from 'react'
import ReactMarkdown from "react-markdown"
import MarkdownCodeBlock from "./MarkdownCodeBlock"

export interface MarkdownProps {
    source: string
    substitute?: { [key: string]: string | undefined | null }
    linkTarget?: '_blank' | ReactMarkdown.LinkTargetResolver
    renderers?: ReactMarkdown.Renderers
}

const Markdown: FunctionComponent<MarkdownProps> = ({ source, substitute, linkTarget, renderers }) => {
    const source2 = substitute ? doSubstitute(source, substitute) : source
    return (
        <div className='markdown-body'>
            <ReactMarkdown
                source={source2}
                renderers={{ code: MarkdownCodeBlock, ...renderers }}
                linkTarget={linkTarget}
            />
        </div>
    );
}

const doSubstitute = (x: string, s: { [key: string]: string | undefined | null }) => {
    let y = x
    for (let k in s) {
        y = y.split(`{${k}}`).join(s[k] || '')
    }
    return y
}

export default Markdown