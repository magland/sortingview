import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startListeningToParent } from '@fi-sci/figurl-interface'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

startListeningToParent()
