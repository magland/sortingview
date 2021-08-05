import { Toolbar } from '@material-ui/core';
import React, { FunctionComponent, useState } from 'react';
import Hyperlink from 'figurl/labbox-react/components/Hyperlink/Hyperlink'


export interface BottomBarInfo {
    currentTime?: number | null
    samplerate: number
    timeRange?: {min: number, max: number} | null
    statusText: string
}

interface Props {
    width: number
    height: number
    info: BottomBarInfo
    onCurrentTimeChanged: (t: number | null) => void
    onTimeRangeChanged: (tr: { min: number, max: number }) => void
}

const TimeWidgetBottomBar: FunctionComponent<Props> = (props) => {
    const { info, height, onCurrentTimeChanged } = props;
    // const style0 = {
    //     position: 'relative',
    //     width: this.props.width,
    //     height: this.props.height
    // };
    return (
        <Toolbar style={{ minHeight: height }}>
            <CurrentTimeControl
                width={180}
                currentTime={info.currentTime || null}
                samplerate={info.samplerate}
                onChange={onCurrentTimeChanged}
            />
                &nbsp;
            <TimeRangeControl
                width={250}
                timeRange={info.timeRange || null}
                samplerate={info.samplerate}
                onChange={props.onTimeRangeChanged}
            />
            <span>{info.statusText}</span>
        </Toolbar>
    );
}

interface CurrentTimeControlProps {
    width: number
    currentTime: number | null
    samplerate: number
    onChange: (t: number) => void
}

const CurrentTimeControl: FunctionComponent<CurrentTimeControlProps> = (props) => {
    const { currentTime, samplerate, width, onChange } = props

    const _handleChange = (txt: string) => {
        let t = fromHumanTime(txt, samplerate);
        if (t !== undefined) {
            onChange(t);
        }
        else {
            console.warn(`Invalid human time string: ${txt}`);
        }
    }
        
    let style0 = {
        width,
        padding: 5,
        border: 'solid 1px lightgray'
    };
    return (
        <div style={style0}>
            Time:&nbsp;
            <EditableText
                width={width - 50}
                title="Click to edit current time"
                text={toHumanTime(currentTime, samplerate)}
                onChange={_handleChange}
            />
        </div>
    )
}

interface TimeRangeControlProps {
    width: number
    samplerate: number
    timeRange: {min: number, max: number} | null
    onChange: (tr: {min: number, max: number}) => void
}

const TimeRangeControl: FunctionComponent<TimeRangeControlProps> = (props) => {
    const _handleChange = (txt: string) => {
        let tr = fromHumanTimeRange(txt, props.samplerate);
        if ((tr === undefined) || (tr === null)) {
            console.warn(`Invalid human time range string: ${txt}`);
        }
        else {
            props.onChange(tr)
        }
    }
    const { timeRange, samplerate } = props;
    let style0 = {
        width: props.width,
        padding: 5,
        border: 'solid 1px lightgray'
    };
    return (
        <div style={style0}>
            Range:&nbsp;
            <EditableText
                width={props.width - 50}
                title="Click to edit time range"
                text={toHumanTimeRange(timeRange, samplerate)}
                onChange={_handleChange}
            />
        </div>
    )
}

const toHumanTimeRange = (tr: {min: number, max: number} | null, samplerate: number) => {
    if (!tr) return 'none';
    return `${toHumanTime(tr.min, samplerate, {nounits: true, num_digits: 3})} - ${toHumanTime(tr.max, samplerate, {num_digits: 3})}`;
}

function fromHumanTimeRange(txt: string, samplerate: number) {
    if (txt === 'none') return null;
    let a = txt.split('-');
    if (a.length !== 2) return undefined;
    let t1 = fromHumanTime(a[0], samplerate, {nounits: true});
    let t2 = fromHumanTime(a[1], samplerate);
    if ((t1 === undefined) || (t2 === undefined))
        return undefined;
    return {min: t1, max: t2}
}

const toHumanTime = (t: number | null, samplerate: number, opts: {num_digits?: number, nounits?: boolean}={}): string => {
    if (t === null) return 'none';
    let sec = round(t / samplerate, opts.num_digits || 6);
    if (opts.nounits) return sec + '';
    else return `${sec} s`;
}

const fromHumanTime = (txt: string, samplerate: number, opts: {nounits?: boolean} = {}): number | undefined => {
    if (txt === 'none') return undefined;
    const list = txt.split(/(\s+)/).filter( e => e.trim().length > 0);
    if (list.length === 1) {
        if (opts.nounits) {
            return fromHumanTime(txt + ' s', samplerate, {nounits: false});
        }
        if (txt.endsWith('s'))
            return fromHumanTime(txt.slice(0, txt.length - 1) + ' s', samplerate);
        else
            return undefined;
    }
    else if (list.length === 2) {
        let val = Number(list[0]);
        if (isNaN(val)) return undefined;
        let units = list[1];
        if (units === 's') {
            return val * samplerate;
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
}

const round = (val: number, num_digits: number) => {
    return Math.round(val * Math.pow(10, num_digits)) / Math.pow(10, num_digits);
}

interface FunctionComponentProps {
    width: number
    text: string
    title: string
    onChange: (s: string) => void
}

const EditableText: FunctionComponent<FunctionComponentProps> = (props) => {
    const [clicked, setClicked] = useState<boolean>(false)
    const [editedText, setEditedText] = useState<string>('')

    const _handleClick = () => {
        if (clicked) return;
        setClicked(true)
        setEditedText(props.text)
    }

    const _handleUnclick = () => {
        setClicked(false)
        props.onChange(editedText)
    }

    const _handleEditedTextChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setEditedText(evt.target.value)
    }

    const _handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            _handleUnclick()
        }
    }

    let style0 = {
        width: props.width
    };
    let link0 = <span></span>;
    if (clicked) {
        link0 = (
            <input
                type={"text"}
                value={editedText}
                readOnly={false}
                onFocus={e => e.target.select()}
                onBlur={() => {_handleUnclick()}}
                autoFocus={true}
                style={style0}
                onChange={(e) => {_handleEditedTextChanged(e)}}
                onKeyDown={(e) => {_handleKeyDown(e)}}
            />
        );
    }
    else {
        let text = props.text;

        link0 = (
            <span title={props.title}>
                <Hyperlink onClick={_handleClick}><span>{text}</span></Hyperlink>
            </span>
        );
    }
    return link0
}

export default TimeWidgetBottomBar