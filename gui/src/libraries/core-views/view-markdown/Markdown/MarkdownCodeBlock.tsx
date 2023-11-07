import { FunctionComponent } from "react";

interface Props {
  value: string
  language: string | undefined
}

const MarkdownCodeBlock: FunctionComponent<Props> = ({value, language=undefined}) => {
  // Syntax react-syntax-highlighter makes the js bundle very large!
  return (
    // <SyntaxHighlighter language={language} style={coy}>
    <span>{value}</span>
    // </SyntaxHighlighter>
  )
}

export default MarkdownCodeBlock;