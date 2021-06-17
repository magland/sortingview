import React, { useCallback, useMemo } from 'react'
import { FunctionComponent } from "react"
import ReactMarkdown from 'react-markdown'
import Hyperlink from '../../commonComponents/Hyperlink/Hyperlink'
import Markdown from '../../commonComponents/Markdown/Markdown'
import RoutePath from '../../route/RoutePath'
import useRoute from '../../route/useRoute'
import introMd from './intro.md.gen'

type Props = {
    
}

const IntroSection: FunctionComponent<Props> = () => {
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