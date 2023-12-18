import { useWindowDimensions } from './libraries/core-utils';
import { getFigureData, SetupUrlState } from '@fi-sci/figurl-interface';
import { defaultUnitSelection, SetupSortingCuration, UnitMetricSelectionContext, unitMetricSelectionReducer, UnitSelectionContext, unitSelectionReducer } from './libraries/spike-sorting-views/index';
import { SetupAnnotations, SetupTimeseriesSelection } from './libraries/timeseries-views';
import { MuiThemeProvider } from '@material-ui/core';
import { useEffect, useMemo, useReducer, useState } from 'react';
import './localStyles.css';
import theme from './theme';
import View from './View';
import { SetupStyleSettings } from './libraries/franklab-views';

const urlSearchParams = new URLSearchParams(window.location.search)
const queryParams = Object.fromEntries(urlSearchParams.entries())

// Example: https://www.figurl.org/f?v=http://localhost:3000&d=sha1://c7e0ae023c4c75d9ae85078e459d7fc8daa1224d&label=Track%20position%20animation%20example&s={}

function App() {
  const [data, setData] = useState<any>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const {width, height} = useWindowDimensions()

  const [unitSelection, unitSelectionDispatch] = useReducer(unitSelectionReducer, defaultUnitSelection)

  const [unitMetricSelection, unitMetricSelectionDispatch] = useReducer(unitMetricSelectionReducer, {})

  useEffect(() => {
    if (queryParams.test === '1') {
      // To test the Test1View without using the figurl parent
      // for example, with no internet connection,
      // use http://localhost:3000?test=1
      setData({type: 'Test1'})
    }
    else {
      getFigureData().then((data: any) => {
        if (!data) {
          setErrorMessage('No data in return from getFigureData()')
          return
        }
        setData(data)
      }).catch((err: any) => {
        setErrorMessage(`Error getting figure data`)
        console.error(`Error getting figure data`, err)
      })
    }
  }, [])

  const opts = useMemo(() => ({}), [])

  if (errorMessage) {
    return <div style={{color: 'red'}}>{errorMessage}</div>
  }

  if (!data) {
    return <div>Waiting for data</div>
  }

  return (
    <MuiThemeProvider theme={theme}>
      <SetupTimeseriesSelection>
        <UnitSelectionContext.Provider value={{unitSelection, unitSelectionDispatch}}>
          <UnitMetricSelectionContext.Provider value={{unitMetricSelection, unitMetricSelectionDispatch}}>
            <SetupAnnotations>
              <SetupUrlState>
                <SetupSortingCuration>
                  <SetupStyleSettings>
                    <View
                      data={data}
                      opts={opts}
                      width={width - 10}
                      height={height - 5}
                    />
                  </SetupStyleSettings>
                </SetupSortingCuration>
              </SetupUrlState>
            </SetupAnnotations>
          </UnitMetricSelectionContext.Provider>
        </UnitSelectionContext.Provider>
      </SetupTimeseriesSelection>
    </MuiThemeProvider>
  )
}

export default App;

