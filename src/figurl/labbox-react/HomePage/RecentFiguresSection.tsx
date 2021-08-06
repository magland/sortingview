import { useChannel } from 'figurl/kachery-react';
import { RecentFigure, RecentFigures } from 'figurl/RecentFigures';
import { FigurlPlugin } from 'figurl/types';
import React, { FunctionComponent, useCallback } from 'react';
import { useMemo } from 'react';
import Hyperlink from '../components/Hyperlink/Hyperlink';

type Props = {
    recentFigures: RecentFigures
    plugins: FigurlPlugin[]
    onOpenFigure?: (recentFigure: RecentFigure) => void
}

const RecentFiguresSection: FunctionComponent<Props> = ({recentFigures, plugins, onOpenFigure}) => {
    const {channelName} = useChannel()
    const x = useMemo(() => {
        return recentFigures.figures.reverse().map(f => {
            const plugin = plugins.filter(p => (p.type === f.type))[0]
            if (!plugin) return undefined
            if (f.channel !== channelName) return undefined
            return {
                label: plugin.getLabel(f.data),
                recentFigure: f
            }
        }).filter(x => (x !== undefined))
    }, [recentFigures, plugins, channelName])
    const handleClick = useCallback((recentFigure?: RecentFigure) => {
        if (!recentFigure) return
        onOpenFigure && onOpenFigure(recentFigure)
    }, [onOpenFigure])
    return (
        <div>
            <h3>Recent figures</h3>
            <ul>
                {
                    x.map(a => (
                        <li><Hyperlink onClick={() => handleClick(a?.recentFigure)}>{a?.label}</Hyperlink></li>
                    ))
                }
            </ul>
        </div>
    )
}

export default RecentFiguresSection