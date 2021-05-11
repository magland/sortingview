import React, { useCallback, useMemo, useState } from 'react'
import { FunctionComponent } from "react"
import ReactMarkdown from 'react-markdown'
import Hyperlink from '../../python/sortingview/gui/commonComponents/Hyperlink/Hyperlink'
import useRoute, {RoutePath} from '../../route/useRoute'
import introMd from './intro.md.gen'
import {GoogleSignIn} from '../../python/sortingview/gui/labbox'
import {useGoogleSignInClient} from '../../python/sortingview/gui/labbox'
import { SelectBackendProviderDialog, useVisible } from '../../python/sortingview/gui/labbox'
import Markdown from '../../python/sortingview/gui/commonComponents/Markdown/Markdown'

type Props = {
    
}

const Home: FunctionComponent<Props> = () => {
    const {setRoute, backendUri, workspaceUri} = useRoute()
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
    const [googleSignInVisible, setGoogleSignInVisible] = useState(false)
    const toggleGoogleSignInVisible = useCallback(() => {setGoogleSignInVisible(v => (!v))}, [])

    const {visible: selectBackendProviderVisible, show: showSelectBackendProvider, hide: hideSelectBackendProvider} = useVisible()

    const handleSelectWorkspace = useCallback(() => {
        setRoute({routePath: '/selectWorkspace'})
    }, [setRoute])

    const handleViewWorkspace = useCallback(() => {
        setRoute({routePath: '/workspace'})
    }, [setRoute])

    const googleSignInClient = useGoogleSignInClient()
    const signedIn = googleSignInClient?.signedIn

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
                        {
                            signedIn ? (
                                <p>You are signed in as {googleSignInClient.profile?.getEmail()}</p>
                            ) : (
                                <p>Some actions on backend providers require authorization. You can optionally <Hyperlink onClick={toggleGoogleSignInVisible}>sign in using a Google account</Hyperlink>.</p>
                            )
                        }                        
                        {
                            (googleSignInVisible || signedIn) && <GoogleSignIn client={googleSignInClient} />
                        }
                    </span>
                )
            }
            {
                backendUri ? (
                    <span>
                        <p>The selected backend provider is: {backendUri}</p>
                        <p><Hyperlink onClick={showSelectBackendProvider}>Select a different backend provider</Hyperlink></p>
                        <p><Hyperlink href="https://github.com/magland/sortingview/blob/main/README.md" target="_blank">Instructions for setting up your own backend provider</Hyperlink></p>
                        {
                            workspaceUri ? (
                                <span>
                                    <p>The selected workspace is: {workspaceUri}</p>
                                    <p><Hyperlink onClick={handleSelectWorkspace}>Select a different workspace</Hyperlink></p>
                                    <Hyperlink onClick={handleViewWorkspace}>View this workspace</Hyperlink>
                                </span>
                            ) : (
                                <span>
                                    <p>The next step is to <Hyperlink onClick={handleSelectWorkspace}>select a workspace</Hyperlink>.</p>
                                </span>
                            )
                        }
                    </span>
                ) : (
                    <p>Start by <Hyperlink onClick={showSelectBackendProvider}>selecting a backend provider</Hyperlink></p>
                )
            }
            <SelectBackendProviderDialog visible={selectBackendProviderVisible} onClose={hideSelectBackendProvider} />
        </span>
    )
}

export default Home