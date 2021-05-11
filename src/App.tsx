import React from 'react';
// import logo from './logo.svg';
import './App.css';
import MainWindow from './MainWindow/MainWindow';
import { MuiThemeProvider } from '@material-ui/core';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';
import {BackendProvidersSetup, GoogleSignInSetup} from './python/sortingview/gui/labbox';

function App() {
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <BackendProvidersSetup>
              <MainWindow />
            </BackendProvidersSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default App;
