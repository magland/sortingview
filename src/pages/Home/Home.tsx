import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FunctionComponent } from "react"
import ReactMarkdown from 'react-markdown'
import Markdown from '../../common/Markdown'
import BackendProviderView from '../../reusable/ApplicationBar/BackendProviderView'
import ModalWindow from '../../reusable/ApplicationBar/ModalWindow'
import Hyperlink from '../../reusable/common/Hyperlink'
import useRoute, {RoutePath} from '../../route/useRoute'
import {useModalDialog} from '../../reusable/ApplicationBar/ApplicationBar'
import introMd from './intro.md.gen'
import selectDataMd from './selectData.md.gen'
import GoogleSignInClient, {GoogleSignInClientOpts} from '../../reusable/googleSignIn/GoogleSignInClient'
import GoogleSignin from '../../reusable/googleSignIn/GoogleSignin'

type Props = {
    
}

const useGoogleSignInClient = (opts: GoogleSignInClientOpts | null) => {
    const [client, setClient] = useState<GoogleSignInClient | null>(null)
    useEffect(() => {
        if (!opts) return
        const c = new GoogleSignInClient(opts)
        c.initialize().then(() => {
            setClient(c)
        })
    }, [opts])
    return client
}

const Home: FunctionComponent<Props> = () => {
    const {setRoute, backendUri} = useRoute()
    const linkTargetResolver = useCallback((uri: string, text: string, title?: string) => {
        return '_blank'
    }, [])
    const opts = googleClientS
    const googleSignInClient = useGoogleSignInClient(opts)
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

    const {visible: backendProviderVisible, handleOpen: openBackendProvider, handleClose: closeBackendProvider} = useModalDialog()
    const handleSelectBackend = useCallback(() => {
        openBackendProvider()
    }, [openBackendProvider])
    
    return (
        <span>
            <Markdown
                source={introMd}
                linkTarget={linkTargetResolver}
                renderers={{...routeRenderers}}
            />
            {
                googleSignInClient && (
                    <span>
                        <p>Some backend providers may require authentication. You can optionally sign in using a Google account.</p>
                        <GoogleSignin client={googleSignInClient} />
                    </span>
                )
            }
            {
                backendUri ? (
                    <span>
                        <p>You have selected a remote backend provider: {backendUri}</p>
                        <p><Hyperlink onClick={handleSelectBackend}>Select a different backend provider</Hyperlink></p>
                        <p><Hyperlink href="https://github.com/magland/sortingview/blob/main/README.md" target="_blank">Instructions for setting up your own backend provider</Hyperlink></p>
                        <Markdown
                            source={selectDataMd}
                            linkTarget={linkTargetResolver}
                            renderers={routeRenderers}
                        />
                    </span>
                ) : (
                    <p>Start by <Hyperlink onClick={handleSelectBackend}>selecting a backend provider</Hyperlink></p>
                )
            }
            <ModalWindow
                open={backendProviderVisible}
                onClose={closeBackendProvider}
            >
                <BackendProviderView
                    onClose={closeBackendProvider}
                />
            </ModalWindow>
        </span>
    )
}

export default Home