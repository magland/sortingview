import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LabboxPlugin } from './python/sortingview/gui/pluginInterface';
import { createExtensionContext, LabboxProvider } from 'labbox'
import registerExtensions from './python/sortingview/gui/extensions/registerExtensions';

const extensionContext = createExtensionContext<LabboxPlugin>()
registerExtensions(extensionContext).then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <LabboxProvider
        extensionContext={extensionContext}
      >
        <App />
      </LabboxProvider>,
    </React.StrictMode>,
    document.getElementById('root')
  );  
})



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
