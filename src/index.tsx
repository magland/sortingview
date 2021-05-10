import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LabboxExtensionContext, LabboxPlugin } from './python/sortingview/extensions/pluginInterface';
import { createExtensionContext, LabboxProvider } from 'labbox'

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

const registerExtensions = async (context: LabboxExtensionContext) => {
  const {activate: activate_correlograms} = await import('./python/sortingview/extensions/correlograms/correlograms')
  activate_correlograms(context)
  const {activate: activate_unitstable} = await import('./python/sortingview/extensions/unitstable/unitstable')
  activate_unitstable(context)
  const {activate: activate_mountainview} = await import('./python/sortingview/extensions/mountainview/mountainview')
  activate_mountainview(context)
}

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
