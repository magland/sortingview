import React, { FunctionComponent } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  value: string
  language: string | undefined
}

const MarkdownCodeBlock: FunctionComponent<Props> = ({value, language=undefined}) => {
  return (
    <SyntaxHighlighter language={language} style={coy}>
      {value}
    </SyntaxHighlighter>
  )
}

export default MarkdownCodeBlock;