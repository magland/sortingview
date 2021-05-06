import { Box, CircularProgress } from '@material-ui/core';
import { CalculationPool, HitherContext } from 'labbox';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import VisibilitySensor from 'react-visibility-sensor';

const ClientSidePlot: FunctionComponent<{
    dataFunctionName: string,
    dataFunctionArgs: {[key: string]: any},
    calculationPool?: CalculationPool,
    boxSize: {width: number, height: number},
    PlotComponent: React.FunctionComponent<{boxSize: {width: number, height: number}, plotData: any, argsObject: {[key: string]: any}, title: string}>,
    plotComponentArgs: {[key: string]: any},
    plotComponentProps?: {[key: string]: any},
    title: string
}> = ({
    dataFunctionName, dataFunctionArgs,
    calculationPool,
    boxSize = { width: 200, height: 200 },
    PlotComponent, plotComponentArgs, plotComponentProps, title
}) => {
    const hither = useContext(HitherContext)
    const [calculationStatus, setCalculationStatus] = useState<string>('waitingForVisible');
    const [calculationError, setCalculationError] = useState<string | null>(null);
    const [plotData, setPlotData] = useState<any | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        ;(async () => {
            if ((calculationStatus === 'waitingForVisible') && (visible)) {
                setCalculationStatus('waiting');
                const slot = calculationPool ? await calculationPool.requestSlot() : null;
                setCalculationStatus('calculating');
                let plot_data;
                try {
                    plot_data = await hither.createHitherJob(
                        dataFunctionName,
                        dataFunctionArgs,
                        {
                            useClientCache: true
                        }
                    ).wait()
                }
                catch (err) {
                    console.error(err);
                    setCalculationError(err.message);
                    setCalculationStatus('error');
                    return;
                }
                finally {
                    slot && slot.complete();
                }
                setPlotData(plot_data);
                setCalculationStatus('finished');
            }
        })()
    }, [dataFunctionName, calculationStatus, calculationPool, dataFunctionArgs, hither, visible])

    if (calculationStatus === 'waitingForVisible') {
        return (
            <VisibilitySensor partialVisibility={true}>
                {({ isVisible }) => {
                    if (isVisible) {
                        // the setTimeout may be needed here to prevent a warning message
                        setTimeout(() => {
                            setVisible(true);
                        }, 0);
                    }
                    else {
                        // the setTimeout may be needed here to prevent a warning message
                        setTimeout(() => {
                            setVisible(false);
                        }, 0);
                    }
                    return (
                        <Box display="flex" width={boxSize.width} height={boxSize.height}
                        >
                            <Box m="auto">
                                <div>waiting-for-visible</div>
                            </Box>
                        </Box>
                    )
                }}
            </VisibilitySensor>
        );
    }
    if (calculationStatus === 'pending' || calculationStatus === 'waiting') {
        return (
            <Box display="flex" width={boxSize.width} height={boxSize.height}>
            </Box>
        );
    }
    else if (calculationStatus === 'calculating') {
        return (
            <Box display="flex" width={boxSize.width} height={boxSize.height}
            >
                <Box m="auto">
                    <CircularProgress />
                </Box>
            </Box>
        );
    } else if (calculationStatus === 'error') {
        return (
            <Box display="flex" width={boxSize.width} height={boxSize.height}
            >
                <Box m="auto">
                    <div>Error in calculation: <pre>{calculationError}</pre></div>
                </Box>
            </Box>
        );
    } else if ((calculationStatus === 'finished') && (plotData)) {
        // TODO: Follow-up on distinction b/w this and <PlotComponent arg1={} arg2={} ... />
        return <PlotComponent
            {...{boxSize, plotData, argsObject: plotComponentArgs, ...(plotComponentProps || {}), title}}
        />
    } else {
        return (
            <div>Unexpected calculation status: {calculationStatus}</div>
        );
    }
}

export default ClientSidePlot;