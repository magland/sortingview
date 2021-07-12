import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import Markdown from 'labbox-react/components/Markdown/Markdown';
import RoutePath from 'labbox-react/MainWindow/RoutePath';
import useRoute from 'labbox-react/MainWindow/useRoute';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

type Props = {
    introMd: string
}

const IntroSection: FunctionComponent<Props> = ({introMd}) => {
    const {setRoute} = useRoute()

    const linkTargetResolver = useCallback((uri: string, text: string, title?: string) => {
        return '_blank'
    }, [])
    
    const routeRenderers: ReactMarkdown.Renderers = useMemo(() => ({
        link: (props) => {
            const value: string = props.children[0].props.value
            const target: string = props.target
            const href = props.href as any as RoutePath
            if (href.startsWith('http')) {
                return <a href={href} target={target}>{value}</a>
            }
            else {
                return <Hyperlink onClick={() => {setRoute({routePath: href})}}>{value}</Hyperlink>
            }
        }
    }), [setRoute])

    return (
        <div className="IntroSection HomeSection">
            <Markdown
                source={introMd}
                linkTarget={linkTargetResolver}
                renderers={{...routeRenderers}}
            />
        </div>
    )
}

export default IntroSection