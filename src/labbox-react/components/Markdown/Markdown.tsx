import 'github-markdown-css'
import useStaticTextReplacement from 'labbox-react/misc/useStaticTextReplacement'
import React, { FunctionComponent } from 'react'
import ReactMarkdown from "react-markdown"
import MarkdownCodeBlock from "./MarkdownCodeBlock"

export interface MarkdownProps {
    source: string
    substitute?: { [key: string]: string | undefined | null }
    linkTarget?: '' | '_blank' | ReactMarkdown.LinkTargetResolver // default is _blank
    renderers?: ReactMarkdown.Renderers
}

const Markdown: FunctionComponent<MarkdownProps> = ({ source, substitute, linkTarget, renderers }) => {
    const nonNullSubstitutions = substitute ?? {}
    Object.keys(nonNullSubstitutions).forEach((key) => nonNullSubstitutions[key] ? nonNullSubstitutions[key] : '')
    const finalSource = useStaticTextReplacement(source, nonNullSubstitutions as {[key: string]: string})
    return (
        <div className='markdown-body'>
            <ReactMarkdown
                source={finalSource}
                renderers={{ code: MarkdownCodeBlock, ...renderers }}
                linkTarget={linkTarget ? linkTarget : '_blank'}
            />
        </div>
    );
}

export default Markdown