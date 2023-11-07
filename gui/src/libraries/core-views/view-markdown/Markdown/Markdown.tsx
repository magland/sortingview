import 'github-markdown-css'
import React, { FunctionComponent } from 'react'
import ReactMarkdown from "react-markdown"

// react-syntax-highlighter makes the js bundle very large!
// const MarkdownCodeBlock = React.lazy(() => import('./MarkdownCodeBlock'))

export interface MarkdownProps {
    source: string
    substitute?: { [key: string]: string | undefined | null }
    linkTarget?: '_blank' | ReactMarkdown.LinkTargetResolver
    renderers?: ReactMarkdown.Renderers
}

const Markdown: FunctionComponent<MarkdownProps> = ({ source, substitute, linkTarget, renderers }) => {
    // This is a hack because there is no npm:process-browserify for package.json
    window.process = {
        cwd: () => ('')
    } as any
    
    const source2 = substitute ? doSubstitute(source, substitute) : source
    return (
        <div className='markdown-body'>
            <ReactMarkdown
                source={source2}
                renderers={renderers}

                // react-syntax-highlighter makes the js bundle very large!
                // renderers={{ code: MarkdownCodeBlock, ...renderers }}

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